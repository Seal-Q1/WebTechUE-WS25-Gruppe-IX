import {type Request, type Response, Router} from 'express';
import pool from '../pool';
import {type RestaurantRow, restaurantSerializer, type UserRow, userSerializer} from '../serializers';
import {sendBadRequest, sendInternalError, sendNotFound} from '../utils';

const router = Router();

// ============ STATISTICS ============

router.get("/stats", async (_req: Request, res: Response) => {
    try {
        const ordersResult = await pool.query(`
            SELECT COUNT(*) as total_orders, COALESCE(SUM(paid_amount), 0) as total_revenue
            FROM "order"
        `);

        const ordersTodayResult = await pool.query(`
            SELECT COUNT(*) as orders_today, COALESCE(SUM(paid_amount), 0) as revenue_today
            FROM "order"
            WHERE DATE(created_at) = CURRENT_DATE
        `);

        const usersResult = await pool.query(`
            SELECT COUNT(*) as total_users FROM users
        `);

        const restaurantsResult = await pool.query(`
            SELECT 
                COUNT(*) as total_restaurants,
                COUNT(*) FILTER (WHERE restaurant_status_id = 'accepted') as active_restaurants,
                COUNT(*) FILTER (WHERE restaurant_status_id = 'pending') as pending_restaurants
            FROM restaurant
        `);

        const stats = {
            totalOrders: parseInt(ordersResult.rows[0].total_orders),
            totalRevenue: parseFloat(ordersResult.rows[0].total_revenue),
            ordersToday: parseInt(ordersTodayResult.rows[0].orders_today),
            revenueToday: parseFloat(ordersTodayResult.rows[0].revenue_today),
            totalUsers: parseInt(usersResult.rows[0].total_users),
            totalRestaurants: parseInt(restaurantsResult.rows[0].total_restaurants),
            activeRestaurants: parseInt(restaurantsResult.rows[0].active_restaurants),
            pendingRestaurants: parseInt(restaurantsResult.rows[0].pending_restaurants)
        };

        res.json(stats);
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching stats");
    }
});

// ============ RESTAURANT MANAGEMENT ============

router.get("/restaurants/pending", async (_req: Request, res: Response) => {
    try {
        const query = `
            SELECT restaurant_id, restaurant_name, owner_id, phone, email, restaurant_status_id,
                   location_name, address_street, address_house_nr, address_postal_code,
                   address_city, address_door, opening_hours_monday, opening_hours_tuesday,
                   opening_hours_wednesday, opening_hours_thursday, opening_hours_friday,
                   opening_hours_saturday, opening_hours_sunday
            FROM restaurant
            WHERE restaurant_status_id = 'pending'
            ORDER BY restaurant_id DESC
        `;
        const result = await pool.query<RestaurantRow>(query);
        res.json(restaurantSerializer.serialize_multiple(result.rows));
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching pending restaurants");
    }
});

router.get("/restaurants/active", async (_req: Request, res: Response) => {
    try {
        const query = `
            SELECT restaurant_id, restaurant_name, owner_id, phone, email, restaurant_status_id,
                   location_name, address_street, address_house_nr, address_postal_code,
                   address_city, address_door, opening_hours_monday, opening_hours_tuesday,
                   opening_hours_wednesday, opening_hours_thursday, opening_hours_friday,
                   opening_hours_saturday, opening_hours_sunday
            FROM restaurant
            WHERE restaurant_status_id = 'accepted'
            ORDER BY restaurant_name ASC
        `;
        const result = await pool.query<RestaurantRow>(query);
        res.json(restaurantSerializer.serialize_multiple(result.rows));
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching active restaurants");
    }
});

router.post("/restaurants/:restaurantId/approve", async (req: Request, res: Response) => {
    try {
        const restaurantId = parseInt(req.params.restaurantId!);
        const query = `
            UPDATE restaurant
            SET restaurant_status_id = 'accepted'
            WHERE restaurant_id = $1
            RETURNING restaurant_id, restaurant_name, owner_id, phone, email, restaurant_status_id,
                      location_name, address_street, address_house_nr, address_postal_code,
                      address_city, address_door, opening_hours_monday, opening_hours_tuesday,
                      opening_hours_wednesday, opening_hours_thursday, opening_hours_friday,
                      opening_hours_saturday, opening_hours_sunday
        `;
        const result = await pool.query<RestaurantRow>(query, [restaurantId]);
        if (result.rows.length === 0) {
            sendNotFound(res, "Restaurant not found");
            return;
        }
        res.json(restaurantSerializer.serialize(result.rows[0]!));
    } catch (error) {
        sendInternalError(res, error, "occurred while approving restaurant");
    }
});

router.post("/restaurants/:restaurantId/reject", async (req: Request, res: Response) => {
    try {
        const restaurantId = parseInt(req.params.restaurantId!);
        const query = `
            UPDATE restaurant
            SET restaurant_status_id = 'rejected'
            WHERE restaurant_id = $1
            RETURNING restaurant_id, restaurant_name, owner_id, phone, email, restaurant_status_id,
                      location_name, address_street, address_house_nr, address_postal_code,
                      address_city, address_door, opening_hours_monday, opening_hours_tuesday,
                      opening_hours_wednesday, opening_hours_thursday, opening_hours_friday,
                      opening_hours_saturday, opening_hours_sunday
        `;
        const result = await pool.query<RestaurantRow>(query, [restaurantId]);
        if (result.rows.length === 0) {
            sendNotFound(res, "Restaurant not found");
            return;
        }
        res.json(restaurantSerializer.serialize(result.rows[0]!));
    } catch (error) {
        sendInternalError(res, error, "occurred while rejecting restaurant");
    }
});

// ============ USER MANAGEMENT ============

interface UserRowExtended extends UserRow {
    user_status?: string;
    warning_count?: number;
}

router.get("/users", async (_req: Request, res: Response) => {
    try {
        const query = `
            SELECT user_id, user_name, first_name, last_name, email, phone,
                   COALESCE(user_status, 'active') as user_status,
                   COALESCE(warning_count, 0) as warning_count
            FROM users
            ORDER BY user_id DESC
        `;
        const result = await pool.query<UserRowExtended>(query);

        const users = result.rows.map(row => ({
            id: row.user_id,
            userName: row.user_name,
            firstName: row.first_name,
            lastName: row.last_name,
            email: row.email,
            phone: row.phone,
            status: row.user_status || 'active',
            warningCount: row.warning_count || 0
        }));

        res.json(users);
    } catch (error) {
        try {
            const simpleQuery = `
                SELECT user_id, user_name, first_name, last_name, email, phone
                FROM users
                ORDER BY user_id DESC
            `;
            const result = await pool.query<UserRow>(simpleQuery);

            const users = result.rows.map(row => ({
                id: row.user_id,
                userName: row.user_name,
                firstName: row.first_name,
                lastName: row.last_name,
                email: row.email,
                phone: row.phone,
                status: 'active',
                warningCount: 0
            }));

            res.json(users);
        } catch (innerError) {
            sendInternalError(res, innerError, "occurred while fetching users");
        }
    }
});

router.post("/users/:userId/warn", async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId!);
        const {reason} = req.body;

        if (!reason) {
            sendBadRequest(res, "Reason is required");
            return;
        }

        const updateQuery = `
            UPDATE users 
            SET user_status = 'warned', warning_count = warning_count + 1 
            WHERE user_id = $1 
            RETURNING user_id, user_name, first_name, last_name, email, phone, user_status, warning_count
        `;
        const result = await pool.query<UserRowExtended>(updateQuery, [userId]);
        if (result.rows.length === 0) {
            sendNotFound(res, "User not found");
            return;
        }
        const row = result.rows[0]!;
        res.json({
            id: row.user_id,
            userName: row.user_name,
            firstName: row.first_name,
            lastName: row.last_name,
            email: row.email,
            phone: row.phone,
            status: row.user_status || 'warned',
            warningCount: row.warning_count || 1
        });
    } catch (error) {
        sendInternalError(res, error, "occurred while warning user");
    }
});

router.post("/users/:userId/suspend", async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId!);
        const {reason} = req.body;

        if (!reason) {
            sendBadRequest(res, "Reason is required");
            return;
        }

        const updateQuery = `
            UPDATE users 
            SET user_status = 'suspended' 
            WHERE user_id = $1 
            RETURNING user_id, user_name, first_name, last_name, email, phone, user_status, warning_count
        `;
        const result = await pool.query<UserRowExtended>(updateQuery, [userId]);
        if (result.rows.length === 0) {
            sendNotFound(res, "User not found");
            return;
        }
        const row = result.rows[0]!;
        res.json({
            id: row.user_id,
            userName: row.user_name,
            firstName: row.first_name,
            lastName: row.last_name,
            email: row.email,
            phone: row.phone,
            status: row.user_status || 'suspended',
            warningCount: row.warning_count || 0
        });
    } catch (error) {
        sendInternalError(res, error, "occurred while suspending user");
    }
});

router.post("/users/:userId/activate", async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId!);

        const updateQuery = `
            UPDATE users 
            SET user_status = 'active', warning_count = 0 
            WHERE user_id = $1 
            RETURNING user_id, user_name, first_name, last_name, email, phone, user_status, warning_count
        `;
        const result = await pool.query<UserRowExtended>(updateQuery, [userId]);
        if (result.rows.length === 0) {
            sendNotFound(res, "User not found");
            return;
        }
        const row = result.rows[0]!;
        res.json({
            id: row.user_id,
            userName: row.user_name,
            firstName: row.first_name,
            lastName: row.last_name,
            email: row.email,
            phone: row.phone,
            status: row.user_status || 'active',
            warningCount: row.warning_count || 0
        });
    } catch (error) {
        sendInternalError(res, error, "occurred while activating user");
    }
});

export default router;
