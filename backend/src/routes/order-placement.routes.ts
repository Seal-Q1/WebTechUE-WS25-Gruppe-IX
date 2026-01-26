import { Router, type Request, type Response } from 'express';
import pool from '../pool';
import {orderSerializer, type OrderRow, OrderItemRow} from '../serializers';
import {OrderRequestDto} from '@shared/types';
import {sendInternalError } from '../utils';

const router = Router();


router.post("/", async (req: Request, res: Response) => {
    const orderRequestDto = req.body as OrderRequestDto;
    try {
        const client = await pool.connect();
        let itemPriceList: OrderItemData[] = []

        // Retrieve individual prices and calculate total unitPrice
        let totalPrice = 0;
        for(let item of orderRequestDto.items) {
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

        await client.query('BEGIN');

        // Create order
        const query = `
        INSERT INTO "order" (
            order_name, order_type, order_status, address_street, address_house_nr, address_postal_code, address_city,
            address_door, paid_amount, payment_method, coupon_id, user_id, created_at
        )
        VALUES ('Test', 'delivery'::order_type_enum, 'preparing'::order_status_enum, 'Teststraße', '815', '9020', 'Klagenfurt',
                null, $1, 'cash'::payment_method_enum, null, 1, DEFAULT)
        RETURNING *;
        `
        const order = await client.query<OrderRow>(query, [totalPrice]);

        // Create order item pairs
        for (let item of orderRequestDto.items) {
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