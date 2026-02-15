import {type Request, type Response, Router} from 'express';
import pool from '../pool';
import {type RestaurantRow, restaurantSerializer, type UserRow, userSerializer} from '../serializers';
import {requiresAdmin, sendBadRequest, sendInternalError, sendNotFound} from '../utils';

const router = Router();


router.get("/stats", requiresAdmin, async (_req: Request, res: Response) => {
    try {
        const ordersResult = await pool.query(`
            SELECT COUNT(*) as total_orders, COALESCE(SUM(paid_amount), 0) as total_revenue
            FROM "order"
        `); //coalesce returns 0 if there aren't any yet

        const ordersTodayResult = await pool.query(`
            SELECT COUNT(*) as orders_today, COALESCE(SUM(paid_amount), 0) as revenue_today
            FROM "order"
            WHERE DATE(created_at) = CURRENT_DATE
        `); //coalesce returns 0 if there aren't any yet

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



router.get("/restaurants/pending", requiresAdmin, async (_req: Request, res: Response) => {
    try {
        const query = `
            SELECT restaurant_id, restaurant_name, owner_id, phone, email, restaurant_status_id,
                   location_name, address_street, address_house_nr, address_postal_code,
                   address_city, address_door, opening_hours_monday, opening_hours_tuesday,
                   opening_hours_wednesday, opening_hours_thursday, opening_hours_friday,
                   opening_hours_saturday, opening_hours_sunday, order_index
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

router.get("/restaurants/active", requiresAdmin, async (_req: Request, res: Response) => {
    try {
        const query = `
            SELECT restaurant_id, restaurant_name, owner_id, phone, email, restaurant_status_id,
                   location_name, address_street, address_house_nr, address_postal_code,
                   address_city, address_door, opening_hours_monday, opening_hours_tuesday,
                   opening_hours_wednesday, opening_hours_thursday, opening_hours_friday,
                   opening_hours_saturday, opening_hours_sunday, order_index
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

router.post("/restaurants/:restaurantId/approve", requiresAdmin, async (req: Request, res: Response) => {
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
                      opening_hours_saturday, opening_hours_sunday, order_index
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

router.post("/restaurants/:restaurantId/reject", requiresAdmin, async (req: Request, res: Response) => {
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
                      opening_hours_saturday, opening_hours_sunday, order_index
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


interface UserRowExtended extends UserRow {
    user_status_id: number;
    warning_count: number;
    status_name?: string;
}

router.get("/users", requiresAdmin, async (_req: Request, res: Response) => {
    try {
        const query = `
            SELECT u.user_id, u.user_name, u.first_name, u.last_name, u.email, u.phone,
                   u.user_status_id, COALESCE(u.warning_count, 0) as warning_count,
                   us.status_name
            FROM users u
            JOIN user_status us ON u.user_status_id = us.user_status_id
            ORDER BY u.user_id DESC
        `;
        const result = await pool.query<UserRowExtended>(query);

        const users = result.rows.map(row => ({
            id: row.user_id,
            userName: row.user_name,
            firstName: row.first_name,
            lastName: row.last_name,
            email: row.email,
            phone: row.phone,
            status: row.status_name || 'ok',
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

router.post("/users/:userId/warn", requiresAdmin, async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId!);
        const {reason} = req.body;
        console.log(`[WARN] Attempting to warn user ${userId} with reason: ${reason}`);

        if (!reason) {
            sendBadRequest(res, "Reason is required");
            return;
        }

        // Insert warning record
        console.log('[WARN] Inserting warning record...');
        await pool.query(
            `INSERT INTO user_warning (user_id, reason) VALUES ($1, $2)`,
            [userId, reason]
        );
        console.log('[WARN] Warning record inserted successfully');

        // Update user status to warned (user_status_id=2) and increment warning count
        console.log('[WARN] Updating user status...');
        const updateQuery = `
            UPDATE users 
            SET user_status_id = 2, warning_count = warning_count + 1 
            WHERE user_id = $1 
            RETURNING user_id, user_name, first_name, last_name, email, phone, user_status_id, warning_count
        `;
        const result = await pool.query<UserRowExtended>(updateQuery, [userId]);
        console.log('[WARN] Update result rows:', result.rows.length);
        if (result.rows.length === 0) {
            sendNotFound(res, "User not found");
            return;
        }
        const row = result.rows[0]!;
        console.log('[WARN] Success! User warned:', row.user_id);
        const statusMap: Record<number, string> = {1: 'ok', 2: 'warned', 3: 'suspended'};
        res.json({
            id: row.user_id,
            userName: row.user_name,
            firstName: row.first_name,
            lastName: row.last_name,
            email: row.email,
            phone: row.phone,
            status: statusMap[row.user_status_id] || 'warned',
            warningCount: row.warning_count || 1
        });
    } catch (error) {
        console.error('[WARN] Error:', error);
        sendInternalError(res, error, "occurred while warning user");
    }
});

router.post("/users/:userId/suspend", requiresAdmin, async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId!);
        const {reason} = req.body;

        if (!reason) {
            sendBadRequest(res, "Reason is required");
            return;
        }

        // Update user status to suspended (user_status_id=3)
        const updateQuery = `
            UPDATE users 
            SET user_status_id = 3 
            WHERE user_id = $1 
            RETURNING user_id, user_name, first_name, last_name, email, phone, user_status_id, warning_count
        `;
        const result = await pool.query<UserRowExtended>(updateQuery, [userId]);
        if (result.rows.length === 0) {
            sendNotFound(res, "User not found");
            return;
        }
        const row = result.rows[0]!;
        const statusMap: Record<number, string> = {1: 'ok', 2: 'warned', 3: 'suspended'};
        res.json({
            id: row.user_id,
            userName: row.user_name,
            firstName: row.first_name,
            lastName: row.last_name,
            email: row.email,
            phone: row.phone,
            status: statusMap[row.user_status_id] || 'suspended',
            warningCount: row.warning_count || 0
        });
    } catch (error) {
        sendInternalError(res, error, "occurred while suspending user");
    }
});

router.post("/users/:userId/activate", requiresAdmin, async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId!);

        // Update user status to active (user_status_id=1) and reset warning count
        const updateQuery = `
            UPDATE users 
            SET user_status_id = 1, warning_count = 0 
            WHERE user_id = $1 
            RETURNING user_id, user_name, first_name, last_name, email, phone, user_status_id, warning_count
        `;
        const result = await pool.query<UserRowExtended>(updateQuery, [userId]);
        if (result.rows.length === 0) {
            sendNotFound(res, "User not found");
            return;
        }
        const row = result.rows[0]!;
        const statusMap: Record<number, string> = {1: 'ok', 2: 'warned', 3: 'suspended'};
        res.json({
            id: row.user_id,
            userName: row.user_name,
            firstName: row.first_name,
            lastName: row.last_name,
            email: row.email,
            phone: row.phone,
            status: statusMap[row.user_status_id] || 'ok',
            warningCount: row.warning_count || 0
        });
    } catch (error) {
        sendInternalError(res, error, "occurred while activating user");
    }
});

// =====================
// PLATFORM SETTINGS
// =====================

interface SettingRow {
    setting_id: number;
    setting_key: string;
    setting_value: string;
    description: string | null;
    updated_at: Date;
}

router.get("/settings", requiresAdmin, async (_req: Request, res: Response) => {
    try {
        const result = await pool.query<SettingRow>(`
            SELECT setting_id, setting_key, setting_value, description, updated_at
            FROM platform_setting
            ORDER BY setting_key ASC
        `);
        const settings: Record<string, string> = {};
        result.rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });
        res.json(settings);
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching settings");
    }
});

router.put("/settings/:key", requiresAdmin, async (req: Request, res: Response) => {
    try {
        const settingKey = req.params.key!;
        const {value} = req.body;

        if (value === undefined || value === null) {
            sendBadRequest(res, "Value is required");
            return;
        }

        const result = await pool.query<SettingRow>(`
            UPDATE platform_setting
            SET setting_value = $1, updated_at = now()
            WHERE setting_key = $2
            RETURNING setting_id, setting_key, setting_value, description, updated_at
        `, [String(value), settingKey]);

        if (result.rows.length === 0) {
            sendNotFound(res, "Setting not found");
            return;
        }

        res.json({key: result.rows[0]!.setting_key, value: result.rows[0]!.setting_value});
    } catch (error) {
        sendInternalError(res, error, "occurred while updating setting");
    }
});

// =====================
// DELIVERY ZONES
// =====================

interface DeliveryZoneRow {
    zone_id: number;
    zone_name: string;
    postal_codes: string;
    city: string;
    is_active: boolean;
    delivery_fee: string;
    created_at: Date;
}

router.get("/delivery-zones", requiresAdmin, async (_req: Request, res: Response) => {
    try {
        const result = await pool.query<DeliveryZoneRow>(`
            SELECT zone_id, zone_name, postal_codes, city, is_active, delivery_fee, created_at
            FROM delivery_zone
            ORDER BY city ASC, zone_name ASC
        `);
        res.json(result.rows.map(row => ({
            id: row.zone_id,
            name: row.zone_name,
            postalCodes: row.postal_codes.split(',').map(s => s.trim()),
            city: row.city,
            isActive: row.is_active,
            deliveryFee: parseFloat(row.delivery_fee),
            createdAt: row.created_at
        })));
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching delivery zones");
    }
});

router.post("/delivery-zones", requiresAdmin, async (req: Request, res: Response) => {
    try {
        const {name, postalCodes, city, deliveryFee, isActive} = req.body;

        if (!name || !postalCodes || !city) {
            sendBadRequest(res, "Name, postal codes, and city are required");
            return;
        }

        const postalCodesStr = Array.isArray(postalCodes) ? postalCodes.join(',') : postalCodes;

        const result = await pool.query<DeliveryZoneRow>(`
            INSERT INTO delivery_zone (zone_name, postal_codes, city, delivery_fee, is_active)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING zone_id, zone_name, postal_codes, city, is_active, delivery_fee, created_at
        `, [name, postalCodesStr, city, deliveryFee || 0, isActive !== false]);

        const row = result.rows[0]!;
        res.status(201).json({
            id: row.zone_id,
            name: row.zone_name,
            postalCodes: row.postal_codes.split(',').map(s => s.trim()),
            city: row.city,
            isActive: row.is_active,
            deliveryFee: parseFloat(row.delivery_fee),
            createdAt: row.created_at
        });
    } catch (error) {
        sendInternalError(res, error, "occurred while creating delivery zone");
    }
});

router.put("/delivery-zones/:zoneId", requiresAdmin, async (req: Request, res: Response) => {
    try {
        const zoneId = parseInt(req.params.zoneId!);
        const {name, postalCodes, city, deliveryFee, isActive} = req.body;

        const postalCodesStr = Array.isArray(postalCodes) ? postalCodes.join(',') : postalCodes;

        const result = await pool.query<DeliveryZoneRow>(`
            UPDATE delivery_zone
            SET zone_name = COALESCE($1, zone_name),
                postal_codes = COALESCE($2, postal_codes),
                city = COALESCE($3, city),
                delivery_fee = COALESCE($4, delivery_fee),
                is_active = COALESCE($5, is_active)
            WHERE zone_id = $6
            RETURNING zone_id, zone_name, postal_codes, city, is_active, delivery_fee, created_at
        `, [name, postalCodesStr, city, deliveryFee, isActive, zoneId]);

        if (result.rows.length === 0) {
            sendNotFound(res, "Delivery zone not found");
            return;
        }

        const row = result.rows[0]!;
        res.json({
            id: row.zone_id,
            name: row.zone_name,
            postalCodes: row.postal_codes.split(',').map(s => s.trim()),
            city: row.city,
            isActive: row.is_active,
            deliveryFee: parseFloat(row.delivery_fee),
            createdAt: row.created_at
        });
    } catch (error) {
        sendInternalError(res, error, "occurred while updating delivery zone");
    }
});

router.delete("/delivery-zones/:zoneId", requiresAdmin, async (req: Request, res: Response) => {
    try {
        const zoneId = parseInt(req.params.zoneId!);
        const result = await pool.query(`DELETE FROM delivery_zone WHERE zone_id = $1 RETURNING zone_id`, [zoneId]);

        if (result.rows.length === 0) {
            sendNotFound(res, "Delivery zone not found");
            return;
        }

        res.json({message: "Delivery zone deleted"});
    } catch (error) {
        sendInternalError(res, error, "occurred while deleting delivery zone");
    }
});

// =====================
// VOUCHERS / PROMO CODES
// =====================

interface VoucherRow {
    coupon_id: number;
    coupon_code: string;
    description: string | null;
    discount_type: string;
    discount_value: string;
    min_order_value: string | null;
    max_uses: number | null;
    current_uses: number;
    start_date: Date | null;
    end_date: Date | null;
    is_active: boolean;
    restaurant_id: number | null;
    restaurant_name?: string;
    created_at: Date;
}

router.get("/vouchers", requiresAdmin, async (_req: Request, res: Response) => {
    try {
        const result = await pool.query<VoucherRow>(`
            SELECT c.coupon_id, c.coupon_code, c.description, c.discount_type, c.discount_value,
                   c.min_order_value, c.max_uses, c.current_uses, c.start_date, c.end_date, 
                   c.is_active, c.restaurant_id, c.created_at, r.restaurant_name
            FROM coupon_code c
            LEFT JOIN restaurant r ON c.restaurant_id = r.restaurant_id
            ORDER BY c.created_at DESC
        `);
        res.json(result.rows.map(row => ({
            id: row.coupon_id,
            code: row.coupon_code,
            description: row.description,
            discountType: row.discount_type,
            discountValue: parseFloat(row.discount_value),
            minOrderValue: row.min_order_value ? parseFloat(row.min_order_value) : null,
            maxUses: row.max_uses,
            currentUses: row.current_uses,
            startDate: row.start_date,
            endDate: row.end_date,
            isActive: row.is_active,
            restaurantId: row.restaurant_id,
            restaurantName: row.restaurant_name || null,
            createdAt: row.created_at
        })));
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching vouchers");
    }
});

router.post("/vouchers", requiresAdmin, async (req: Request, res: Response) => {
    try {
        const {code, description, discountType, discountValue, minOrderValue, maxUses, startDate, endDate, isActive, restaurantId} = req.body;

        if (!code || !discountType || discountValue === undefined) {
            sendBadRequest(res, "Code, discount type, and discount value are required");
            return;
        }

        const result = await pool.query<VoucherRow>(`
            INSERT INTO coupon_code (coupon_code, description, discount_type, discount_value, min_order_value, max_uses, start_date, end_date, is_active, restaurant_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING coupon_id, coupon_code, description, discount_type, discount_value,
                      min_order_value, max_uses, current_uses, start_date, end_date, is_active, restaurant_id, created_at
        `, [code, description, discountType, discountValue, minOrderValue || 0, maxUses || null, startDate || null, endDate || null, isActive !== false, restaurantId || null]);

        const row = result.rows[0]!;
        res.status(201).json({
            id: row.coupon_id,
            code: row.coupon_code,
            description: row.description,
            discountType: row.discount_type,
            discountValue: parseFloat(row.discount_value),
            minOrderValue: row.min_order_value ? parseFloat(row.min_order_value) : null,
            maxUses: row.max_uses,
            currentUses: row.current_uses,
            startDate: row.start_date,
            endDate: row.end_date,
            isActive: row.is_active,
            restaurantId: row.restaurant_id,
            createdAt: row.created_at
        });
    } catch (error) {
        sendInternalError(res, error, "occurred while creating voucher");
    }
});

router.put("/vouchers/:voucherId", requiresAdmin, async (req: Request, res: Response) => {
    try {
        const voucherId = parseInt(req.params.voucherId!);
        const {code, description, discountType, discountValue, minOrderValue, maxUses, startDate, endDate, isActive, restaurantId} = req.body;

        const result = await pool.query<VoucherRow>(`
            UPDATE coupon_code
            SET coupon_code = COALESCE($1, coupon_code),
                description = COALESCE($2, description),
                discount_type = COALESCE($3, discount_type),
                discount_value = COALESCE($4, discount_value),
                min_order_value = COALESCE($5, min_order_value),
                max_uses = $6,
                start_date = $7,
                end_date = $8,
                is_active = COALESCE($9, is_active),
                restaurant_id = $10
            WHERE coupon_id = $11
            RETURNING coupon_id, coupon_code, description, discount_type, discount_value,
                      min_order_value, max_uses, current_uses, start_date, end_date, is_active, restaurant_id, created_at
        `, [code, description, discountType, discountValue, minOrderValue, maxUses, startDate, endDate, isActive, restaurantId, voucherId]);

        if (result.rows.length === 0) {
            sendNotFound(res, "Voucher not found");
            return;
        }

        const row = result.rows[0]!;
        res.json({
            id: row.coupon_id,
            code: row.coupon_code,
            description: row.description,
            discountType: row.discount_type,
            discountValue: parseFloat(row.discount_value),
            minOrderValue: row.min_order_value ? parseFloat(row.min_order_value) : null,
            maxUses: row.max_uses,
            currentUses: row.current_uses,
            startDate: row.start_date,
            endDate: row.end_date,
            isActive: row.is_active,
            restaurantId: row.restaurant_id,
            createdAt: row.created_at
        });
    } catch (error) {
        sendInternalError(res, error, "occurred while updating voucher");
    }
});

router.delete("/vouchers/:voucherId", requiresAdmin, async (req: Request, res: Response) => {
    try {
        const voucherId = parseInt(req.params.voucherId!);
        const result = await pool.query(`DELETE FROM coupon_code WHERE coupon_id = $1 RETURNING coupon_id`, [voucherId]);

        if (result.rows.length === 0) {
            sendNotFound(res, "Voucher not found");
            return;
        }

        res.json({message: "Voucher deleted"});
    } catch (error) {
        sendInternalError(res, error, "occurred while deleting voucher");
    }
});

// =====================
// REPORTING
// =====================

router.get("/reports/orders", requiresAdmin, async (req: Request, res: Response) => {
    try {
        const {startDate, endDate, groupBy} = req.query;
        
        let dateFilter = '';
        const params: (string | undefined)[] = [];
        
        if (startDate) {
            params.push(startDate as string);
            dateFilter += ` AND created_at >= $${params.length}`;
        }
        if (endDate) {
            params.push(endDate as string);
            dateFilter += ` AND created_at <= $${params.length}`;
        }

        let groupByClause = '';
        let selectExtra = '';
        
        if (groupBy === 'day') {
            selectExtra = `DATE(created_at) as period,`;
            groupByClause = 'GROUP BY DATE(created_at) ORDER BY period';
        } else if (groupBy === 'week') {
            selectExtra = `DATE_TRUNC('week', created_at) as period,`;
            groupByClause = `GROUP BY DATE_TRUNC('week', created_at) ORDER BY period`;
        } else if (groupBy === 'month') {
            selectExtra = `DATE_TRUNC('month', created_at) as period,`;
            groupByClause = `GROUP BY DATE_TRUNC('month', created_at) ORDER BY period`;
        }

        const query = `
            SELECT ${selectExtra}
                   COUNT(*) as total_orders,
                   COALESCE(SUM(paid_amount), 0) as total_revenue,
                   COALESCE(AVG(paid_amount), 0) as avg_order_value,
                   COUNT(*) FILTER (WHERE order_status = 'fulfilled') as completed_orders,
                   COUNT(*) FILTER (WHERE order_status = 'cancelled') as cancelled_orders
            FROM "order"
            WHERE 1=1 ${dateFilter}
            ${groupByClause}
        `;

        const result = await pool.query(query, params);
        res.json(result.rows.map(row => ({
            period: row.period || null,
            totalOrders: parseInt(row.total_orders),
            totalRevenue: parseFloat(row.total_revenue),
            avgOrderValue: parseFloat(row.avg_order_value),
            completedOrders: parseInt(row.completed_orders),
            cancelledOrders: parseInt(row.cancelled_orders)
        })));
    } catch (error) {
        sendInternalError(res, error, "occurred while generating orders report");
    }
});

router.get("/reports/users", requiresAdmin, async (req: Request, res: Response) => {
    try {
        const {startDate, endDate} = req.query;
        
        let dateFilter = '';
        const params: (string | undefined)[] = [];
        
        if (startDate) {
            params.push(startDate as string);
            dateFilter += ` AND timestamp >= $${params.length}`;
        }
        if (endDate) {
            params.push(endDate as string);
            dateFilter += ` AND timestamp <= $${params.length}`;
        }

        // Total users
        const totalUsersResult = await pool.query(`SELECT COUNT(*) as total FROM users`);
        
        // Login activity by day
        const loginActivityQuery = `
            SELECT DATE(timestamp) as login_date,
                   COUNT(*) as login_count,
                   COUNT(DISTINCT user_id) as unique_users
            FROM login_stat
            WHERE 1=1 ${dateFilter}
            GROUP BY DATE(timestamp)
            ORDER BY login_date DESC
            LIMIT 30
        `;
        const loginActivityResult = await pool.query(loginActivityQuery, params);

        // User status breakdown
        const statusQuery = `
            SELECT us.status_name as status, COUNT(*) as count
            FROM users u
            JOIN user_status us ON u.user_status_id = us.user_status_id
            GROUP BY us.status_name
        `;
        const statusResult = await pool.query(statusQuery);

        res.json({
            totalUsers: parseInt(totalUsersResult.rows[0].total),
            statusBreakdown: statusResult.rows.map(row => ({
                status: row.status,
                count: parseInt(row.count)
            })),
            loginActivity: loginActivityResult.rows.map(row => ({
                date: row.login_date,
                loginCount: parseInt(row.login_count),
                uniqueUsers: parseInt(row.unique_users)
            }))
        });
    } catch (error) {
        sendInternalError(res, error, "occurred while generating users report");
    }
});

router.get("/reports/restaurants", requiresAdmin, async (_req: Request, res: Response) => {
    try {
        // Status breakdown
        const statusQuery = `
            SELECT restaurant_status_id as status, COUNT(*) as count
            FROM restaurant
            GROUP BY restaurant_status_id
        `;
        const statusResult = await pool.query(statusQuery);

        // Top restaurants by order count
        const topRestaurantsQuery = `
            SELECT r.restaurant_id, r.restaurant_name,
                   COUNT(DISTINCT oi.order_id) as order_count,
                   COALESCE(SUM(oi.quantity * oi.unit_price), 0) as total_revenue
            FROM restaurant r
            LEFT JOIN menu_item mi ON r.restaurant_id = mi.restaurant_id
            LEFT JOIN order_item oi ON mi.item_id = oi.item_id
            WHERE r.restaurant_status_id = 'accepted'
            GROUP BY r.restaurant_id, r.restaurant_name
            ORDER BY order_count DESC
            LIMIT 10
        `;
        const topRestaurantsResult = await pool.query(topRestaurantsQuery);

        res.json({
            statusBreakdown: statusResult.rows.map(row => ({
                status: row.status,
                count: parseInt(row.count)
            })),
            topRestaurants: topRestaurantsResult.rows.map(row => ({
                id: row.restaurant_id,
                name: row.restaurant_name,
                orderCount: parseInt(row.order_count),
                totalRevenue: parseFloat(row.total_revenue)
            }))
        });
    } catch (error) {
        sendInternalError(res, error, "occurred while generating restaurants report");
    }
});

export default router;
