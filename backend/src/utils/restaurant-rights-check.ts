import type {Request} from "express";
import {getAuthDetails} from "./auth-check";
import assert from "node:assert";
import pool from "../pool";
import type {RestaurantRow} from "../serializers";

const ADMIN_ROLE = 3

export async function assertRestaurantRights(restaurantId: number, req: Request) {
    const authDetails = getAuthDetails(req);
    assert(authDetails?.userId === await getRestaurantOwner(restaurantId) || authDetails?.roleId === ADMIN_ROLE,
        'User is not owner of restaurant!');
}

async function getRestaurantOwner(restaurantId: number) {
    const query = `SELECT * FROM restaurant WHERE restaurant_id = $1`;
    const result = await pool.query<RestaurantRow>(query, [restaurantId]);
    if (result.rowCount === 0) {
        return null;
    }
    return result.rows[0]!.owner_id;
}