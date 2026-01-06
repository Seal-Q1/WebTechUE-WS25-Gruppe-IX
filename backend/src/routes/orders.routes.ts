import { Router, type Request, type Response } from 'express';
import pool from '../pool';
import { orderSerializer, orderItemSerializer, type OrderRow, type OrderItemRow } from '../serializers';
import { OrderStatusEnum } from '@shared/types';
import { sendNotFound, sendBadRequest, sendInternalError } from '../utils';

const router = Router();

// "Get all orders of all restaurants"     // TODO: filter by restaurantId when restaurant table exists
router.get("/", async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT order_id,
             order_name,
             order_type,
             order_status,
             address_street,
             address_house_nr,
             address_postal_code,
             address_city,
             address_door,
             paid_amount,
             payment_method,
             coupon_id,
             user_id,
             created_at
      FROM "order"
      ORDER BY created_at DESC
    `;
    const result = await pool.query<OrderRow>(query);
    res.json(orderSerializer.serialize_multiple(result.rows));
  } catch (error) {
    sendInternalError(res, error, "occurred while fetching orders");
  }
});

// "Get the status of an order"
router.get("/:orderId", async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId!);
    const query = `
      SELECT order_id,
             order_name,
             order_type,
             order_status,
             address_street,
             address_house_nr,
             address_postal_code,
             address_city,
             address_door,
             paid_amount,
             payment_method,
             coupon_id,
             user_id,
             created_at
      FROM "order"
      WHERE order_id = $1
    `;
    const result = await pool.query<OrderRow>(query, [orderId]);
    if (result.rows.length === 0) {
      sendNotFound(res, "Could not find order");
      return;
    }
    res.json(orderSerializer.serialize(result.rows[0]!));
  } catch (error) {
    sendInternalError(res, error, "occurred while fetching order");
  }
});

// "Update the status of an order"
router.patch("/:orderId/status", async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId!);
    const { status } = req.body as { status: OrderStatusEnum };

    if (!status || !Object.values(OrderStatusEnum).includes(status)) {
      sendBadRequest(res, "Invalid status");
      return;
    }

    const query = `
      UPDATE "order"
      SET order_status = $1
      WHERE order_id = $2
      RETURNING order_id,
                order_name,
                order_type,
                order_status,
                address_street,
                address_house_nr,
                address_postal_code,
                address_city,
                address_door,
                paid_amount,
                payment_method,
                coupon_id,
                user_id,
                created_at
    `;
    const result = await pool.query<OrderRow>(query, [status, orderId]);
    if (result.rows.length === 0) {
      sendNotFound(res, "Order could not be found");
      return;
    }
    res.json(orderSerializer.serialize(result.rows[0]!));
  } catch (error) {
    sendInternalError(res, error, "occurred while updating order status");
  }
});

// "Delete an order"
router.delete("/:orderId", async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId!);
    const result = await pool.query('DELETE FROM "order" WHERE order_id = $1 RETURNING order_id', [orderId]);
    if (result.rowCount === 0) {
      sendNotFound(res, "Order could not be found");
      return;
    }
    res.status(204).send();
  } catch (error) {
    sendInternalError(res, error, "occurred while deleting order");
  }
});

// "Get all order_items of an order"
router.get("/:orderId/items", async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId!);
    const query = `
      SELECT order_item_id,
             item_id,
             quantity,
             unit_price
      FROM order_item
      WHERE order_id = $1
    `;
    const result = await pool.query<OrderItemRow>(query, [orderId]);
    res.json(orderItemSerializer.serialize_multiple(result.rows));
  } catch (error) {
    sendInternalError(res, error, "occurred while fetching order-items");
  }
});

export default router;
