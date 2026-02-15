import { Router, type Request, type Response } from 'express';
import pool from '../pool';
import { menuItemSerializer, type MenuItemRow, imageSerializer, type ImageRow } from '../serializers';
import { sendNotFound, sendInternalError, randomDelay, requiresAuth } from '../utils';

const router = Router({ mergeParams: true });

router.get("/", async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId!);
    const query = `
        SELECT item_id,
               restaurant_id,
               item_name,
               item_price,
               item_description,
               is_deleted,
               order_index
        FROM menu_item
        WHERE restaurant_id = $1
          AND is_deleted = FALSE
        ORDER BY order_index ASC, item_id ASC
    `;
    const result = await pool.query<MenuItemRow>(query, [restaurantId]);
    res.json(menuItemSerializer.serialize_multiple(result.rows));
  } catch (error) {
    sendInternalError(res, error, "occurred while fetching menu items");
  }
});

router.get("/:itemId", async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId!);
    const itemId = parseInt(req.params.itemId!);
    const query = `
      SELECT item_id,
             restaurant_id,
             item_name,
             item_price,
             item_description,
             is_deleted,
             order_index
      FROM menu_item
      WHERE item_id = $1
        AND restaurant_id = $2
        AND is_deleted = FALSE
    `;
    const result = await pool.query<MenuItemRow>(query, [itemId, restaurantId]);
    if (result.rows.length === 0) {
      sendNotFound(res, "Could not find MenuItem");
      return;
    }
    res.json(menuItemSerializer.serialize(result.rows[0]!));
  } catch (error) {
    sendInternalError(res, error, "occurred while fetching menu item");
  }
});

// assumption: no concurrent writes (only one user will change ordering at the same time); simplifies logic
router.post("/", requiresAuth, async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId!);
    const { name, price, description } = req.body;
    const query = `
      INSERT INTO menu_item (restaurant_id, item_name, item_price, item_description, order_index)
      VALUES ($1, $2, $3, $4,
              COALESCE((SELECT MAX(order_index) + 1 FROM menu_item WHERE restaurant_id = $1 AND is_deleted = FALSE), 0))
      RETURNING item_id, restaurant_id, item_name, item_price, item_description, is_deleted, order_index
    `; //coalesce returns 0 if there aren't any yet
    const result = await pool.query<MenuItemRow>(query, [restaurantId, name, price, description || null]);
    res.status(201).json(menuItemSerializer.serialize(result.rows[0]!));
  } catch (error) {
    sendInternalError(res, error, "occurred while creating menu item");
  }
});

router.put("/:itemId", requiresAuth, async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId!);
    const itemId = parseInt(req.params.itemId!);
    const { name, price, description } = req.body;
    const query = `
      UPDATE menu_item
      SET item_name = $1,
          item_price = $2,
          item_description = $3
      WHERE item_id = $4
        AND restaurant_id = $5
        AND is_deleted = FALSE
      RETURNING item_id, restaurant_id, item_name, item_price, item_description, is_deleted, order_index
    `;
    const result = await pool.query<MenuItemRow>(query, [name, price, description || null, itemId, restaurantId]);
    if (result.rows.length === 0) {
      sendNotFound(res, "Could not find MenuItem");
      return;
    }
    res.json(menuItemSerializer.serialize(result.rows[0]!));
  } catch (error) {
    sendInternalError(res, error, "occurred while updating menu item");
  }
});

router.delete("/:itemId", requiresAuth, async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId!);
    const itemId = parseInt(req.params.itemId!);
    const query = `
      UPDATE menu_item
      SET is_deleted = TRUE
      WHERE item_id = $1
        AND restaurant_id = $2
        AND is_deleted = FALSE
      RETURNING item_id
    `;
    const result = await pool.query(query, [itemId, restaurantId]);
    if (result.rows.length === 0) {
      sendNotFound(res, "Could not find MenuItem");
      return;
    }
    res.status(204).send();
  } catch (error) {
    sendInternalError(res, error, "occurred while deleting menu item");
  }
});

router.get("/:itemId/image", async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId!);
    const itemId = parseInt(req.params.itemId!);
        
    await randomDelay();
      
    const query = `
      SELECT item_id as id, item_picture as image
      FROM menu_item
      WHERE item_id = $1
        AND restaurant_id = $2
        AND is_deleted = FALSE
    `;
    const result = await pool.query<ImageRow>(query, [itemId, restaurantId]);
    if (result.rows.length === 0) {
      sendNotFound(res, "Could not find MenuItem");
      return;
    }
    res.json(imageSerializer.serialize(result.rows[0]!));
  } catch (error) {
    sendInternalError(res, error, "occurred while fetching menu item image");
  }
});

router.put("/:itemId/image", requiresAuth, async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId!);
    const itemId = parseInt(req.params.itemId!);
    const { image } = req.body as { image: string | null };
    const query = `
      UPDATE menu_item
      SET item_picture = $1
      WHERE item_id = $2
        AND restaurant_id = $3
        AND is_deleted = FALSE
      RETURNING item_id as id, item_picture as image
    `;
    const result = await pool.query<ImageRow>(query, [image, itemId, restaurantId]);
    if (result.rows.length === 0) {
      sendNotFound(res, "Could not find MenuItem");
      return;
    }
    res.json(imageSerializer.serialize(result.rows[0]!));
  } catch (error) {
    sendInternalError(res, error, "occurred while updating menu item image");
  }
});

router.patch("/order", requiresAuth, async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId!);
    const items = req.body as { id: number; orderIndex: number }[];
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of items) {
        await client.query(
          'UPDATE menu_item SET order_index = $1 WHERE item_id = $2 AND restaurant_id = $3',
          [item.orderIndex, item.id, restaurantId]
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
    sendInternalError(res, error, "occurred while updating menu item order");
  }
});

export default router;

