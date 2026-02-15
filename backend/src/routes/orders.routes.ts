import { Router, type Request, type Response } from 'express';
import pool from '../pool';
import {orderSerializer, type OrderRow, OrderItemRow, CouponCodeRow} from '../serializers';
import {OrderRequestDto} from '@shared/types';
import {parseTokenUserId, requiresAuth, sendInternalError, sendNotFound} from '../utils';
import assert from "node:assert";

const router = Router();

router.get("/my", requiresAuth, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    try {
        const query = `
      SELECT * FROM "order"
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
        const result = await pool.query<OrderRow>(query, [userId]);
        res.json(orderSerializer.serialize_multiple(result.rows));
    }
    catch (error) {
        sendInternalError(res, error, "occurred while fetching orders");
    }
});

router.post("/", requiresAuth, async (req: Request, res: Response) => {
    const dto = req.body as OrderRequestDto;
    const userId = (req as any).userId;

    assert(dto.items.length > 0, 'At least one item must be ordered');

    let restaurantId: number = dto.items[0]!.restaurantId;
    for(let item of dto.items) {
        assert(item.restaurantId === restaurantId, 'All items must be from same restaurant');
    }

    try {
        const client = await pool.connect();
        let itemPriceList: OrderItemData[] = []

        // Retrieve individual prices and calculate total unitPrice
        let totalPrice = 0;
        for(let item of dto.items) {
            const getPriceQuery = `
                SELECT item_price FROM menu_item
                WHERE item_id = $1 and restaurant_id = $2;
            `
            const values = [
                item.dishId,
                item.restaurantId
            ]
            const result = await client.query(getPriceQuery, values);

            const itemPrice = parseFloat(result.rows[0]["item_price"])

            itemPriceList.push(new OrderItemData(item.restaurantId, item.dishId, itemPrice))
            totalPrice += item.quantity * itemPrice;
        }

        // Retrieve coupon information (optional)
        let effectiveDiscount = 0;
        let couponId: number | null = null;
        
        if (dto.couponCode) {
            const couponQuery = `
                SELECT *
                FROM coupon_code
                WHERE coupon_code = $1
                  AND (restaurant_id = $2 OR restaurant_id IS NULL);
            `
            const couponResult = await client.query<CouponCodeRow>(couponQuery,
                [dto.couponCode, restaurantId]
            );
            const couponInfo = couponResult.rows[0];
            if (couponInfo) {
                couponId = couponInfo.coupon_id;
                if (couponInfo.discount_type === 'fixed') {
                    effectiveDiscount = couponInfo.discount_value;
                }
                else {
                    effectiveDiscount = totalPrice * couponInfo.discount_value * 0.01;
                }
            }
        }

        await client.query('BEGIN');

        // Create order
        const query = `
        INSERT INTO "order" (
            order_name, order_type, order_status, address_street, address_house_nr, address_postal_code, address_city,
            address_door, paid_amount, payment_method, coupon_id, user_id, created_at
        )
        VALUES ('Order', 'delivery'::order_type_enum, 'preparing'::order_status_enum, $1, $2, $3, $4,
                $5, $6, 'card', $7, $8, DEFAULT)
        RETURNING *;
        `
        const order = await client.query<OrderRow>(query,
            [dto.address.street, dto.address.houseNr, dto.address.postalCode, dto.address.city,
                dto.address.door, totalPrice - effectiveDiscount, couponId, userId]
        );

        // Create order item pairs
        for (let item of dto.items) {
            const query = `
                INSERT INTO "order_item" (
                    order_id, item_id, quantity, unit_price
                )
                VALUES ($1, $2, $3, $4)
                RETURNING *;
            `
            // Get matching helper object containing unit price
            let itemPriceObj: OrderItemData = itemPriceList.find(helper => helper.restaurantId === item.restaurantId && helper.dishId === item.dishId)!;

            await client.query<OrderItemRow>(query,
                [order.rows[0]!.order_id, item.dishId, item.quantity, itemPriceObj.unitPrice]);
        }

        await client.query('COMMIT');
        client.release();
        res.status(201).json(orderSerializer.serialize(order.rows[0]!));
    }
    catch (error) {
        sendInternalError(res, error, "occurred while creating order");
    }
})

export default router;

class OrderItemData {
    constructor(
        public restaurantId: number,
        public dishId: number,
        public unitPrice: number
    ) {}
}