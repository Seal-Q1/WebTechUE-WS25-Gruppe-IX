import {type Request, type Response, Router} from 'express';
import pool from '../pool';
import {type RestaurantRow, restaurantSerializer, type ImageRow, imageSerializer} from '../serializers';
import {sendInternalError, sendNotFound} from '../utils';

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
                   opening_hours_sunday
            FROM restaurant
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
                   opening_hours_sunday
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
                      opening_hours_thursday, opening_hours_friday, opening_hours_saturday, opening_hours_sunday
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
                address_city, address_door
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING restaurant_id, restaurant_name, owner_id, phone, email, restaurant_status_id,
                      location_name, address_street, address_house_nr, address_postal_code, address_city,
                      address_door, opening_hours_monday, opening_hours_tuesday, opening_hours_wednesday,
                      opening_hours_thursday, opening_hours_friday, opening_hours_saturday, opening_hours_sunday
        `;
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
        
        // FOR TESTING TODO REMOVE ME
        await new Promise(resolve => setTimeout(resolve, 2000));
        
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

export default router;
