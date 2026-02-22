import {Router, type Request, type Response} from 'express';
import pool from '../pool';
import {
    cuisineSerializer,
    type CuisineRow,
    cuisineRestaurantMapSerializer, CuisineRestaurantMapRow
} from '../serializers';
import {sendNotFound, sendInternalError, requiresAuth} from '../utils';
import {CuisineRestaurantMapDto} from "@shared/types";
import assert from "node:assert";
import {requiresRestaurantOwner} from "../utils/auth-check";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
    try {
        const query = `
            SELECT cuisine_id,
                   cuisine_name,
                   cuisine_description,
                   cuisine_emoji,
                   order_index
            FROM cuisine
            ORDER BY order_index ASC, cuisine_id ASC
        `;
        const result = await pool.query<CuisineRow>(query);
        res.json(cuisineSerializer.serialize_multiple(result.rows));
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching cuisines");
    }
});

router.get("/restaurant", async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT * FROM restaurant_cuisine_map
        `;
        const result = await pool.query<CuisineRestaurantMapRow>(query);
        res.json(cuisineRestaurantMapSerializer.serialize_multiple(result.rows));
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching cuisine-restaurant map");
    }
});

router.post("/restaurant/", requiresRestaurantOwner, async (req: Request, res: Response) => {
    try {
        const dto = req.body as CuisineRestaurantMapDto;

        const query = `
            INSERT INTO restaurant_cuisine_map (restaurant_id, cuisine_id)
            VALUES($1, $2)
            RETURNING *;
        `;
        const result = await pool.query<CuisineRestaurantMapRow>(query, [dto.restaurantId, dto.cuisineId]);
        res.json(cuisineRestaurantMapSerializer.serialize_multiple(result.rows));
    } catch (error) {
        sendInternalError(res, error, "occurred while inserting cuisine-restaurant mapping");
    }
});

router.delete("/restaurant/:restaurantId/:cuisineId", requiresRestaurantOwner, async (req: Request, res: Response) => {
    try {
        const restaurantId = parseInt(req.params.restaurantId!);
        const cuisineId = parseInt(req.params.cuisineId!);

        const query = `
            DELETE FROM restaurant_cuisine_map
            WHERE restaurant_id = $1 and cuisine_id = $2
            RETURNING *;
        `;
        const result = await pool.query<CuisineRestaurantMapDto>(query, [restaurantId, cuisineId]);
        if (result.rows.length === 0) {
            sendNotFound(res, "Cuisine-restaurant mapping does not exist");
            return;
        }
        res.status(204).send();
    } catch (error) {
        sendInternalError(res, error, "occurred while deleting cuisine-restaurant mapping");
    }
});

router.get("/restaurant/:restaurantId", async (req: Request, res: Response) => {
    try {
        const restaurantId = parseInt(req.params.restaurantId!);
        const query = `
            SELECT * FROM cuisine Cuisine
            JOIN restaurant_cuisine_map Map ON Map.cuisine_id = Cuisine.cuisine_id
            WHERE restaurant_id = $1
        `;
        const result = await pool.query<CuisineRow>(query, [restaurantId]);
        res.json(cuisineSerializer.serialize_multiple(result.rows));
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching cuisine");
    }
});

router.get("/:cuisineId", async (req: Request, res: Response) => {
    try {
        const cuisineId = parseInt(req.params.cuisineId!);
        const query = `
            SELECT cuisine_id,
                   cuisine_name,
                   cuisine_description,
                   cuisine_emoji,
                   order_index
            FROM cuisine
            WHERE cuisine_id = $1
        `;
        const result = await pool.query<CuisineRow>(query, [cuisineId]);
        if (result.rows.length === 0) {
            sendNotFound(res, "Could not find Cuisine");
            return;
        }
        res.json(cuisineSerializer.serialize(result.rows[0]!));
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching cuisine");
    }
});

// assumption: no concurrent writes (only one user will change ordering at the same time); simplifies logic
router.post("/", requiresAuth, async (req: Request, res: Response) => {
    try {
        const {name, description, emoji} = req.body;
        const query = `
            INSERT INTO cuisine (cuisine_name, cuisine_description, cuisine_emoji, order_index)
            VALUES ($1, $2, $3,
                    COALESCE((SELECT MAX(order_index) + 1 FROM cuisine), 0))
            RETURNING cuisine_id, cuisine_name, cuisine_description, cuisine_emoji, order_index
        `; //coalesce returns 0 if there aren't any yet
        const result = await pool.query<CuisineRow>(query, [name, description || null, emoji || null]);
        res.status(201).json(cuisineSerializer.serialize(result.rows[0]!));
    } catch (error) {
        sendInternalError(res, error, "occurred while creating cuisine");
    }
});

router.put("/:cuisineId", requiresAuth, async (req: Request, res: Response) => {
    try {
        const cuisineId = parseInt(req.params.cuisineId!);
        const {name, description, emoji} = req.body;
        const query = `
            UPDATE cuisine
            SET cuisine_name        = $1,
                cuisine_description = $2,
                cuisine_emoji       = $3
            WHERE cuisine_id = $4
            RETURNING cuisine_id, cuisine_name, cuisine_description, cuisine_emoji, order_index
        `;
        const result = await pool.query<CuisineRow>(query, [name, description || null, emoji || null, cuisineId]);
        if (result.rows.length === 0) {
            sendNotFound(res, "Could not find Cuisine");
            return;
        }
        res.json(cuisineSerializer.serialize(result.rows[0]!));
    } catch (error) {
        sendInternalError(res, error, "occurred while updating cuisine");
    }
});

router.delete("/:cuisineId", requiresAuth, async (req: Request, res: Response) => {
    try {
        const cuisineId = parseInt(req.params.cuisineId!);
        const query = `
            DELETE
            FROM cuisine
            WHERE cuisine_id = $1
            RETURNING cuisine_id
        `;
        const result = await pool.query(query, [cuisineId]);
        if (result.rows.length === 0) {
            sendNotFound(res, "Could not find Cuisine");
            return;
        }
        res.status(204).send();
    } catch (error) {
        sendInternalError(res, error, "occurred while deleting cuisine");
    }
});

router.patch("/order", requiresAuth, async (req: Request, res: Response) => {
    try {
        const items = req.body as { id: number; orderIndex: number }[];
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const item of items) {
                await client.query(
                    'UPDATE cuisine SET order_index = $1 WHERE cuisine_id = $2',
                    [item.orderIndex, item.id]
                );
            }
            await client.query('COMMIT');
            res.status(204).send();
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (error) {
        sendInternalError(res, error, "occurred while updating cuisine order");
    }
});

export default router;
