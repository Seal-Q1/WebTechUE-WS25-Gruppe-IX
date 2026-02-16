import {type Request, type Response, Router} from 'express';
import pool from '../pool';
import {
    type RestaurantRow,
    restaurantSerializer,
    type ImageRow,
    imageSerializer,
    RestaurantReviewRow,
    restaurantReviewSerializer, DishReviewRow, dishReviewSerializer, restaurantReviewAggregateSerializer,
    RestaurantReviewAggregateRow, DishReviewAggregateRow, dishReviewAggregateSerializer
} from '../serializers';
import {sendInternalError, sendNotFound, randomDelay, requiresAuth, parseTokenUserId} from '../utils';
import {AddressDto, RestaurantReviewDto, RestaurantReviewDtoToServer} from "@shared/types";
import {QueryResult} from "pg";
import {requiresRestaurantOwner} from "../utils/auth-check";
import {GeolocationService} from "../services/geolocation.service";

const router = Router();
const geolocationService: GeolocationService = new GeolocationService();

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
            WHERE restaurant_status_id IN ('pending', 'accepted', 'rejected')
            ORDER BY order_index ASC, restaurant_id ASC
        `;
        const result = await pool.query<RestaurantRow>(query);
        console.log("Fetched restaurants:", result.rows.length, "rows");
        const serialized = restaurantSerializer.serialize_multiple(result.rows);
        console.log("Serialized restaurants:", serialized.length);
        res.json(serialized);
    } catch (error) {
        console.error("Full error:", error);
        sendInternalError(res, error, "occurred while fetching restaurants");
    }
});

router.get("/reviews", async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT restaurant_id, count(*), avg(rating)
            FROM restaurant_review
            GROUP BY restaurant_id
        `;
        const result = await pool.query<RestaurantReviewAggregateRow>(query);
        res.json(restaurantReviewAggregateSerializer.serialize_multiple(result.rows));
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching aggregated restaurant reviews");
    }
});

router.get("/:restaurantId/reviews", async (req: Request, res: Response) => {
    try {
        const restaurantId = parseInt(req.params.restaurantId!);
        const query = `
            SELECT *
            FROM restaurant_review
            WHERE restaurant_id = $1
        `;
        const result = await pool.query<RestaurantReviewRow>(query, [restaurantId]);
        res.json(restaurantReviewSerializer.serialize_multiple(result.rows));
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching restaurant reviews");
    }
});

router.post("/:restaurantId/reviews", requiresAuth, async (req: Request, res: Response) => {
    try {
        const restaurantId = parseInt(req.params.restaurantId!);
        const userId = parseTokenUserId(req.headers.authorization);
        const dto = req.body as RestaurantReviewDtoToServer;

        const oldReviewQuery = `
            SELECT *
            FROM restaurant_review
            WHERE restaurant_id = $1
            AND user_id = $2
        `;
        const oldReviewResult = await pool.query<DishReviewRow>(oldReviewQuery,
            [restaurantId, userId]
        );

        // Change query depending on whether a review already exists
        let result: QueryResult<RestaurantReviewRow>;
        if(oldReviewResult.rows.length > 0) {
            const updateReviewQuery = `
                UPDATE restaurant_review
                SET
                    rating = $1,
                    review_text = $2,
                    timestamp = $3
                WHERE restaurant_id = $4
                    AND user_id = $5
                RETURNING *;
            `;
            result = await pool.query<RestaurantReviewRow>(updateReviewQuery,
                [dto.rating, dto.reviewText, new Date(), restaurantId, userId]
            );
        }
        else {
            const insertReviewQuery = `
                INSERT INTO restaurant_review (restaurant_id, user_id, rating, review_text, timestamp)
                VALUES ($1, $2, $3, $4, DEFAULT)
                RETURNING *;
            `
            result = await pool.query<RestaurantReviewRow>(insertReviewQuery,
                [restaurantId, userId, dto.rating, dto.reviewText]
            );
        }
        res.status(201).json(restaurantReviewSerializer.serialize(result.rows[0]!));
    } catch (error) {
        sendInternalError(res, error, "occurred while inserting restaurant review");
    }
});

router.get("/:restaurantId/menu-item-reviews", async (req: Request, res: Response) => {
    try {
        const restaurantId = parseInt(req.params.restaurantId!);
        const query = `
            SELECT dish_review.item_id, count(*), avg(rating)
            FROM dish_review
            NATURAL JOIN menu_item
            WHERE restaurant_id = $1
            GROUP BY dish_review.item_id
        `;
        const result = await pool.query<DishReviewAggregateRow>(query, [restaurantId]);
        res.json(dishReviewAggregateSerializer.serialize_multiple(result.rows));
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching aggregated dish reviews");
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

router.put("/:restaurantId/manage-profile", requiresRestaurantOwner, async (req: Request, res: Response) => {
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
router.post("/", requiresRestaurantOwner, async (req: Request, res: Response) => {
    try {
        const {name, phone, email, locationName, address} = req.body as {
            name: string,
            phone: string,
            email: string,
            locationName: string,
            address: AddressDto
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

        const coordinates = await geolocationService.toCoordinates(address);
        const coordinateUpdateQuery = `
            UPDATE restaurant
            SET
                latitude = $1,
                longitude = $2
            WHERE restaurant_id = $3
            RETURNING *
        `
        const coordinateUpdateResult = await pool.query<RestaurantRow>(coordinateUpdateQuery,
            [coordinates.latitude, coordinates.longitude, result.rows[0]!.restaurant_id],
        );

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

router.put("/:restaurantId/image", requiresRestaurantOwner, async (req: Request, res: Response) => {
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

router.patch("/order", requiresRestaurantOwner, async (req: Request, res: Response) => {
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

router.delete("/:restaurantId", requiresRestaurantOwner, async (req: Request, res: Response) => {
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
