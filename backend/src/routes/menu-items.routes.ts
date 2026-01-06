import { Router, type Request, type Response } from 'express';
import pool from '../pool';
import { menuItemSerializer, type MenuItemRow } from '../serializers';
import { sendNotFound, sendInternalError } from '../utils';

const router = Router();

// "Get all menu items of a restaurant"
router.get("/", async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT item_id,
             item_name,
             item_price,
             item_description
      FROM menu_item
      WHERE is_deleted = FALSE
    `;
    const result = await pool.query<MenuItemRow>(query);
    res.json(menuItemSerializer.serialize_multiple(result.rows));
  } catch (error) {
    sendInternalError(res, error, "occurred while fetching menu items");
  }
});

// "Get the data of a single menu item of a restaurant""
router.get("/:itemId", async (req: Request, res: Response) => {
  try {
    const itemId = parseInt(req.params.itemId!);
    const query = `
      SELECT item_id,
             item_name,
             item_price,
             item_description
      FROM menu_item
      WHERE item_id = $1
        AND is_deleted = FALSE
    `;
    const result = await pool.query<MenuItemRow>(query, [itemId]);
    if (result.rows.length === 0) {
      sendNotFound(res, "Could not find MenuItem");
      return;
    }
    res.json(menuItemSerializer.serialize(result.rows[0]!));
  } catch (error) {
    sendInternalError(res, error, "occurred while fetching menu item");
  }
});

export default router;
