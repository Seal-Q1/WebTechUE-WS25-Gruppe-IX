import { Router, type Request, type Response } from 'express';
import pool from '../pool';
import { menuItemSerializer, type MenuItemRow, imageSerializer, type ImageRow } from '../serializers';
import { sendNotFound, sendInternalError } from '../utils';

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
               is_deleted
        FROM menu_item
        WHERE restaurant_id = $1
          AND is_deleted = FALSE
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
             is_deleted
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

router.post("/", async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId!);
    const { name, price, description } = req.body;
    const query = `
      INSERT INTO menu_item (restaurant_id, item_name, item_price, item_description)
      VALUES ($1, $2, $3, $4)
      RETURNING item_id, restaurant_id, item_name, item_price, item_description, is_deleted
    `;
    const result = await pool.query<MenuItemRow>(query, [restaurantId, name, price, description || null]);
    res.status(201).json(menuItemSerializer.serialize(result.rows[0]!));
  } catch (error) {
    sendInternalError(res, error, "occurred while creating menu item");
  }
});

router.put("/:itemId", async (req: Request, res: Response) => {
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
      RETURNING item_id, restaurant_id, item_name, item_price, item_description, is_deleted
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

router.delete("/:itemId", async (req: Request, res: Response) => {
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
        
      // FOR TESTING TODO REMOVE ME
      await new Promise(resolve => setTimeout(resolve, 5000));
      
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

router.put("/:itemId/image", async (req: Request, res: Response) => {
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

export default router;

