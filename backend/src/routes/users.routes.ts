import {Router, type Request, type Response} from 'express';
import pool from '../pool';
import {userSerializer, type UserRow} from '../serializers';
import {sendInternalError} from '../utils';

const router = Router();

// "Get all users that exist"
router.get("/", async (_req: Request, res: Response) => {
    try {
        const result = await pool.query<UserRow>('SELECT * FROM "users"');
        res.json(userSerializer.serialize_multiple(result.rows));
    } catch (error) {
        sendInternalError(res, error, "occurred while fetching users");
    }
});

export default router;
