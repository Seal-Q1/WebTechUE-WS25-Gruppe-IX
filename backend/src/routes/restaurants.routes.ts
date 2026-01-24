import {type Request, type Response, Router} from 'express';
import pool from '../pool';
import {type RestaurantRow, restaurantSerializer, type ImageRow, imageSerializer} from '../serializers';
import {sendInternalError, sendNotFound, randomDelay} from '../utils';

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
    try {
        const query = `
            SELECT restaurant_id,
                   restaurant_name,
                   owner_id,
                   phone,
                   email,
                   restaurant_status_id,
                   location_name,
                   address_street,
                   address_house_nr,
                   address_postal_code,
                   address_city,
                   address_door,
                   opening_hours_monday,
                   opening_hours_tuesday,
                   opening_hours_wednesday,
                   opening_hours_thursday,
                   opening_hours_friday,
                   opening_hours_saturday,
                   opening_hours_sunday,
                   order_index
            FROM restaurant
            ORDER BY order_index ASC, restaurant_id ASC
        `;
        const result = await pool.query<RestaurantRow>(query);
        res.json(restaurantSerializer.serialize_multiple(result.rows));
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching restaurants");
    }
});

router.get("/:restaurantId/manage-profile", async (req: Request, res: Response) => {
    try {
        const restaurantId = parseInt(req.params.restaurantId!);
        const query = `
            SELECT restaurant_id,
                   restaurant_name,
                   owner_id,
                   phone,
                   email,
                   restaurant_status_id,
                   location_name,
                   address_street,
                   address_house_nr,
                   address_postal_code,
                   address_city,
                   address_door,
                   opening_hours_monday,
                   opening_hours_tuesday,
                   opening_hours_wednesday,
                   opening_hours_thursday,
                   opening_hours_friday,
                   opening_hours_saturday,
                   opening_hours_sunday,
                   order_index
            FROM restaurant
            WHERE restaurant_id = $1
        `;
        const result = await pool.query<RestaurantRow>(query, [restaurantId]);
        if (result.rows.length === 0) {
            sendNotFound(res, "Could not find Restaurant");
            return;
        }
        res.json(restaurantSerializer.serialize(result.rows[0]!));
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching restaurant profile");
    }
});

router.put("/:restaurantId/manage-profile", async (req: Request, res: Response) => {
    try {
        const restaurantId = parseInt(req.params.restaurantId!);
        const {name, phone, email, openingHours} = req.body;
        const query = `
            UPDATE restaurant
            SET restaurant_name         = $1,
                phone                   = $2,
                email                   = $3,
                opening_hours_monday    = $4,
                opening_hours_tuesday   = $5,
                opening_hours_wednesday = $6,
                opening_hours_thursday  = $7,
                opening_hours_friday    = $8,
                opening_hours_saturday  = $9,
                opening_hours_sunday    = $10
            WHERE restaurant_id = $11
            RETURNING restaurant_id, restaurant_name, owner_id, phone, email, restaurant_status_id,
                      location_name, address_street, address_house_nr, address_postal_code, address_city,
                      address_door, opening_hours_monday, opening_hours_tuesday, opening_hours_wednesday,
                      opening_hours_thursday, opening_hours_friday, opening_hours_saturday, opening_hours_sunday,
                      order_index
        `;
        const result = await pool.query<RestaurantRow>(query, [
            name,
            phone,
            email,
            openingHours?.monday || null,
            openingHours?.tuesday || null,
            openingHours?.wednesday || null,
            openingHours?.thursday || null,
            openingHours?.friday || null,
            openingHours?.saturday || null,
            openingHours?.sunday || null,
            restaurantId
        ]);
        if (result.rows.length === 0) {
            sendNotFound(res, "Could not find Restaurant");
            return;
        }
        res.json(restaurantSerializer.serialize(result.rows[0]!));
    } catch (error) {
        sendInternalError(res, error, "occurred while updating restaurant profile");
    }
});

// assumption: no concurrent writes (only one user will change ordering at the same time); simplifies logic
router.post("/", async (req: Request, res: Response) => {
    try {
        const {name, phone, email, locationName, address} = req.body as {
            name: string,
            phone: string,
            email: string,
            locationName: string,
            address: { street: string, houseNr: string, postalCode: string, city: string, door: string }
        };
        const query = `
            INSERT INTO restaurant (
                restaurant_name, owner_id, phone, email, restaurant_status_id,
                location_name, address_street, address_house_nr, address_postal_code,
                address_city, address_door, order_index
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
                    COALESCE((SELECT MAX(order_index) + 1 FROM restaurant), 0))
            RETURNING restaurant_id, restaurant_name, owner_id, phone, email, restaurant_status_id,
                      location_name, address_street, address_house_nr, address_postal_code, address_city,
                      address_door, opening_hours_monday, opening_hours_tuesday, opening_hours_wednesday,
                      opening_hours_thursday, opening_hours_friday, opening_hours_saturday, opening_hours_sunday,
                      order_index
        `; //coalesce returns 0 if there aren't any restaurants yet
        const values = [
            name,
            null,
            phone,
            email,
            'pending',
            locationName,
            address.street,
            address.houseNr,
            address.postalCode,
            address.city,
            address.door
        ];
        const result = await pool.query<RestaurantRow>(query, values);
        res.status(201).json(restaurantSerializer.serialize(result.rows[0]!));
    } catch (error) {
        sendInternalError(res, error, "occurred while creating restaurant");
    }
});

router.get("/:restaurantId/image", async (req: Request, res: Response) => {
    try {
        const restaurantId = parseInt(req.params.restaurantId!);
        
        await randomDelay();
        
        const query = `SELECT restaurant_id as id, image FROM restaurant WHERE restaurant_id = $1`;
        const result = await pool.query<ImageRow>(query, [restaurantId]);
        if (result.rows.length === 0) {
            sendNotFound(res, "Could not find Restaurant");
            return;
        }
        res.json(imageSerializer.serialize(result.rows[0]!));
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching restaurant image");
    }
});

router.put("/:restaurantId/image", async (req: Request, res: Response) => {
    try {
        const restaurantId = parseInt(req.params.restaurantId!);
        const { image } = req.body as { image: string | null };
        const query = `
            UPDATE restaurant
            SET image = $1
            WHERE restaurant_id = $2
            RETURNING restaurant_id as id, image
        `;
        const result = await pool.query<ImageRow>(query, [image, restaurantId]);
        if (result.rows.length === 0) {
            sendNotFound(res, "Could not find Restaurant");
            return;
        }
        res.json(imageSerializer.serialize(result.rows[0]!));
    } catch (error) {
        sendInternalError(res, error, "occurred while updating restaurant image");
    }
});

//TODO permission to do so via auth.
router.patch("/order", async (req: Request, res: Response) => {
    try {
        const items = req.body as { id: number; orderIndex: number }[];
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const item of items) {
                await client.query(
                    'UPDATE restaurant SET order_index = $1 WHERE restaurant_id = $2',
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
        sendInternalError(res, error, "occurred while updating restaurant order");
    }
});

//TODO permission to do so via auth.
router.delete("/:restaurantId", async (req: Request, res: Response) => {
    try {
        const restaurantId = parseInt(req.params.restaurantId!);
        const query = `DELETE FROM restaurant WHERE restaurant_id = $1 RETURNING restaurant_id`;
        const result = await pool.query(query, [restaurantId]);
        if (result.rowCount === 0) {
            sendNotFound(res, "Could not find Restaurant");
            return;
        }
        res.status(204).send();
    } catch (error) {
        sendInternalError(res, error, "occurred while deleting restaurant");
    }
});

export default router;
