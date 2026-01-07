import { Router, type Request, type Response } from 'express';
import pool from '../pool';
import { menuItemSerializer, type MenuItemRow } from '../serializers';
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
               item_picture,
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
             item_picture,
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
    const { name, price, description, picture } = req.body;
    const pictureBuffer = picture ? Buffer.from(picture, 'base64') : null;
    const query = `
      INSERT INTO menu_item (restaurant_id, item_name, item_price, item_description, item_picture)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING item_id, restaurant_id, item_name, item_price, item_description, item_picture, is_deleted
    `;
    const result = await pool.query<MenuItemRow>(query, [restaurantId, name, price, description || null, pictureBuffer]);
    res.status(201).json(menuItemSerializer.serialize(result.rows[0]!));
  } catch (error) {
    sendInternalError(res, error, "occurred while creating menu item");
  }
});

router.put("/:itemId", async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId!);
    const itemId = parseInt(req.params.itemId!);
    const { name, price, description, picture } = req.body;
    const pictureBuffer = picture ? Buffer.from(picture, 'base64') : null;
    const query = `
      UPDATE menu_item
      SET item_name = $1,
          item_price = $2,
          item_description = $3,
          item_picture = $4
      WHERE item_id = $5
        AND restaurant_id = $6
        AND is_deleted = FALSE
      RETURNING item_id, restaurant_id, item_name, item_price, item_description, item_picture, is_deleted
    `;
    const result = await pool.query<MenuItemRow>(query, [name, price, description || null, pictureBuffer, itemId, restaurantId]);
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

export default router;

