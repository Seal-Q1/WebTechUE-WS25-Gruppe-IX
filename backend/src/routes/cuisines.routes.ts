import {Router, type Request, type Response} from 'express';
import pool from '../pool';
import {cuisineSerializer, type CuisineRow} from '../serializers';
import {sendNotFound, sendInternalError} from '../utils';

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
    try {
        const query = `
            SELECT cuisine_id,
                   cuisine_name,
                   cuisine_description
            FROM cuisine
        `;
        const result = await pool.query<CuisineRow>(query);
        res.json(cuisineSerializer.serialize_multiple(result.rows));
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching cuisines");
    }
});

router.get("/:cuisineId", async (req: Request, res: Response) => {
    try {
        const cuisineId = parseInt(req.params.cuisineId!);
        const query = `
            SELECT cuisine_id,
                   cuisine_name,
                   cuisine_description
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

router.post("/", async (req: Request, res: Response) => {
    try {
        const {name, description} = req.body;
        const query = `
            INSERT INTO cuisine (cuisine_name, cuisine_description)
            VALUES ($1, $2)
            RETURNING cuisine_id, cuisine_name, cuisine_description
        `;
        const result = await pool.query<CuisineRow>(query, [name, description || null]);
        res.status(201).json(cuisineSerializer.serialize(result.rows[0]!));
    } catch (error) {
        sendInternalError(res, error, "occurred while creating cuisine");
    }
});

router.put("/:cuisineId", async (req: Request, res: Response) => {
    try {
        const cuisineId = parseInt(req.params.cuisineId!);
        const {name, description} = req.body;
        const query = `
            UPDATE cuisine
            SET cuisine_name        = $1,
                cuisine_description = $2
            WHERE cuisine_id = $3
            RETURNING cuisine_id, cuisine_name, cuisine_description
        `;
        const result = await pool.query<CuisineRow>(query, [name, description || null, cuisineId]);
        if (result.rows.length === 0) {
            sendNotFound(res, "Could not find Cuisine");
            return;
        }
        res.json(cuisineSerializer.serialize(result.rows[0]!));
    } catch (error) {
        sendInternalError(res, error, "occurred while updating cuisine");
    }
});

router.delete("/:cuisineId", async (req: Request, res: Response) => {
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

export default router;
