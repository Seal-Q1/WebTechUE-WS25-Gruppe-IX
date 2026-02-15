import { Router, Request, Response } from 'express';
import pool from '../pool';
import type {
  UserPointsDto,
  PromotionDto,
  RewardDto,
  PointTransactionDto,
  RewardRedemptionDto,
  LoyaltyDashboardDto,
  PointsEarnedResponseDto,
  RedeemRewardRequestDto
} from '@shared/types';
import {requiresAuth, sendInternalError, sendNotFound} from "../utils";
import {CouponCodeRow, couponCodeSerializer} from "../serializers";
import {CouponCodeSerializer} from "../serializers/coupon-code.serializer";

const router = Router();

// Helper: Get user ID from token (simple base64 decode)
function getUserIdFromToken(authHeader: string | undefined): number | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.slice(7);
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const userId = parseInt(decoded, 10);
    return isNaN(userId) ? null : userId;
  } catch {
    return null;
  }
}

// Helper: Serialize promotion from DB row
function serializePromotion(row: any): PromotionDto {
  return {
    id: row.promotion_id,
    name: row.promotion_name,
    description: row.description,
    multiplier: parseFloat(row.multiplier),
    startDate: row.start_date,
    endDate: row.end_date,
    isActive: row.is_active,
    applicableDays: row.applicable_days 
      ? row.applicable_days.split(',').map((d: string) => parseInt(d.trim(), 10))
      : undefined
  };
}

// Helper: Serialize reward from DB row
function serializeReward(row: any, userBalance?: number): RewardDto {
  return {
    id: row.reward_id,
    name: row.reward_name,
    description: row.description,
    rewardType: row.reward_type,
    pointsCost: row.points_cost,
    discountValue: row.discount_value ? parseFloat(row.discount_value) : undefined,
    menuItemId: row.menu_item_id,
    menuItemName: row.item_name,
    minOrderValue: parseFloat(row.min_order_value || 0),
    validFrom: row.valid_from,
    validUntil: row.valid_until,
    isActive: row.is_active,
    isLimitedTime: !!(row.valid_from || row.valid_until),
    canAfford: userBalance !== undefined ? userBalance >= row.points_cost : undefined
  };
}

// Helper: Serialize point transaction from DB row
function serializeTransaction(row: any): PointTransactionDto {
  return {
    id: row.transaction_id,
    userId: row.user_id,
    points: row.points,
    transactionType: row.transaction_type,
    orderId: row.order_id,
    promotionId: row.promotion_id,
    promotionName: row.promotion_name,
    redemptionId: row.redemption_id,
    description: row.description,
    createdAt: row.created_at
  };
}

// Helper: Serialize redemption from DB row
function serializeRedemption(row: any): RewardRedemptionDto {
  const snapshot = typeof row.reward_snapshot === 'string' 
    ? JSON.parse(row.reward_snapshot) 
    : row.reward_snapshot;
  return {
    id: row.redemption_id,
    userId: row.user_id,
    rewardId: row.reward_id,
    rewardName: snapshot.name || row.reward_name,
    rewardType: snapshot.rewardType || row.reward_type,
    pointsSpent: row.points_spent,
    orderId: row.order_id,
    redeemedAt: row.redeemed_at,
    usedAt: row.used_at,
    discountValue: snapshot.discountValue
  };
}

// Helper: Get active promotions for current day
async function getActivePromotions(): Promise<PromotionDto[]> {
  const dayOfWeek = new Date().getDay(); // 0=Sunday, 6=Saturday
  
  const result = await pool.query(`
    SELECT * FROM promotion
    WHERE is_active = true
      AND now() BETWEEN start_date AND end_date
      AND (applicable_days IS NULL OR applicable_days LIKE $1 OR applicable_days LIKE $2 OR applicable_days LIKE $3)
    ORDER BY multiplier DESC
  `, [`${dayOfWeek},%`, `%,${dayOfWeek},%`, `%,${dayOfWeek}`]);
  
  // Also check for exact match
  const result2 = await pool.query(`
    SELECT * FROM promotion
    WHERE is_active = true
      AND now() BETWEEN start_date AND end_date
      AND applicable_days = $1
  `, [dayOfWeek.toString()]);
  
  const combined = [...result.rows, ...result2.rows];
  const unique = combined.filter((row, index, self) => 
    index === self.findIndex(r => r.promotion_id === row.promotion_id)
  );
  
  return unique.map(serializePromotion);
}

// Helper: Calculate points multiplier from active promotions
async function getPointsMultiplier(): Promise<{ multiplier: number; promotionName?: string }> {
  const promotions = await getActivePromotions();
  if (promotions.length === 0) {
    return { multiplier: 1.0 };
  }
  // Use the highest multiplier
  const best = promotions.reduce((a, b) => a.multiplier > b.multiplier ? a : b);
  return { multiplier: best.multiplier, promotionName: best.name };
}

// Helper: Ensure user has a points record
async function ensureUserPoints(userId: number): Promise<void> {
  await pool.query(`
    INSERT INTO user_points (user_id, total_points_earned, current_balance)
    VALUES ($1, 0, 0)
    ON CONFLICT (user_id) DO NOTHING
  `, [userId]);
}

// GET /api/loyalty/dashboard - Get user's loyalty dashboard
router.get('/dashboard', requiresAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  
  try {
    await ensureUserPoints(userId);
    
    // Get user points
    const pointsResult = await pool.query(
      'SELECT * FROM user_points WHERE user_id = $1',
      [userId]
    );
    
    const points: UserPointsDto = {
      userId: pointsResult.rows[0].user_id,
      totalPointsEarned: pointsResult.rows[0].total_points_earned,
      currentBalance: pointsResult.rows[0].current_balance,
      updatedAt: pointsResult.rows[0].updated_at
    };
    
    // Get active promotions
    const activePromotions = await getActivePromotions();
    
    // Get available rewards
    const rewardsResult = await pool.query(`
      SELECT r.*, m.item_name 
      FROM reward r
      LEFT JOIN menu_item m ON r.menu_item_id = m.item_id
      WHERE r.is_active = true
        AND (r.valid_from IS NULL OR r.valid_from <= now())
        AND (r.valid_until IS NULL OR r.valid_until >= now())
      ORDER BY r.points_cost ASC
    `);
    
    const availableRewards = rewardsResult.rows.map(row => 
      serializeReward(row, points.currentBalance)
    );
    
    // Get recent transactions (last 20)
    const transactionsResult = await pool.query(`
      SELECT pt.*, p.promotion_name
      FROM point_transaction pt
      LEFT JOIN promotion p ON pt.promotion_id = p.promotion_id
      WHERE pt.user_id = $1
      ORDER BY pt.created_at DESC
      LIMIT 20
    `, [userId]);
    
    const recentTransactions = transactionsResult.rows.map(serializeTransaction);
    
    // Get pending (unused) redemptions
    const redemptionsResult = await pool.query(`
      SELECT rr.*, r.reward_name, r.reward_type
      FROM reward_redemption rr
      JOIN reward r ON rr.reward_id = r.reward_id
      WHERE rr.user_id = $1 AND rr.used_at IS NULL
      ORDER BY rr.redeemed_at DESC
    `, [userId]);
    
    const pendingRedemptions = redemptionsResult.rows.map(serializeRedemption);
    
    const dashboard: LoyaltyDashboardDto = {
      points,
      activePromotions,
      availableRewards,
      recentTransactions,
      pendingRedemptions
    };
    
    res.json(dashboard);
  } catch (error) {
    console.error('Error fetching loyalty dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch loyalty dashboard' });
  }
});

// GET /api/loyalty/points - Get user's current points
router.get('/points', requiresAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  
  try {
    await ensureUserPoints(userId);
    
    const result = await pool.query(
      'SELECT * FROM user_points WHERE user_id = $1',
      [userId]
    );
    
    const points: UserPointsDto = {
      userId: result.rows[0].user_id,
      totalPointsEarned: result.rows[0].total_points_earned,
      currentBalance: result.rows[0].current_balance,
      updatedAt: result.rows[0].updated_at
    };
    
    res.json(points);
  } catch (error) {
    console.error('Error fetching points:', error);
    res.status(500).json({ error: 'Failed to fetch points' });
  }
});

// GET /api/loyalty/promotions - Get all active promotions
router.get('/promotions', async (req: Request, res: Response) => {
  try {
    const promotions = await getActivePromotions();
    res.json(promotions);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ error: 'Failed to fetch promotions' });
  }
});

// GET /api/loyalty/rewards - Get available rewards
router.get('/rewards', requiresAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  
  try {
    await ensureUserPoints(userId);
    
    const pointsResult = await pool.query(
      'SELECT current_balance FROM user_points WHERE user_id = $1',
      [userId]
    );
    const balance = pointsResult.rows[0]?.current_balance || 0;
    
    const result = await pool.query(`
      SELECT r.*, m.item_name 
      FROM reward r
      LEFT JOIN menu_item m ON r.menu_item_id = m.item_id
      WHERE r.is_active = true
        AND (r.valid_from IS NULL OR r.valid_from <= now())
        AND (r.valid_until IS NULL OR r.valid_until >= now())
      ORDER BY r.points_cost ASC
    `);
    
    const rewards = result.rows.map(row => serializeReward(row, balance));
    res.json(rewards);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

// POST /api/loyalty/redeem - Redeem points for a reward
router.post('/redeem', requiresAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { rewardId } = req.body as RedeemRewardRequestDto;
  
  if (!rewardId) {
    return res.status(400).json({ error: 'Reward ID is required' });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get reward details
    const rewardResult = await client.query(`
      SELECT r.*, m.item_name 
      FROM reward r
      LEFT JOIN menu_item m ON r.menu_item_id = m.item_id
      WHERE r.reward_id = $1 AND r.is_active = true
        AND (r.valid_from IS NULL OR r.valid_from <= now())
        AND (r.valid_until IS NULL OR r.valid_until >= now())
    `, [rewardId]);
    
    if (rewardResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Reward not found or no longer available' });
    }
    
    const reward = rewardResult.rows[0];
    
    // Get user's current balance
    const pointsResult = await client.query(
      'SELECT current_balance FROM user_points WHERE user_id = $1 FOR UPDATE',
      [userId]
    );
    
    if (pointsResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'User points record not found' });
    }
    
    const currentBalance = pointsResult.rows[0].current_balance;
    
    if (currentBalance < reward.points_cost) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Insufficient points', 
        required: reward.points_cost, 
        available: currentBalance 
      });
    }
    
    // Create reward snapshot
    const rewardSnapshot = {
      name: reward.reward_name,
      rewardType: reward.reward_type,
      discountValue: reward.discount_value ? parseFloat(reward.discount_value) : null,
      menuItemId: reward.menu_item_id,
      menuItemName: reward.item_name,
      minOrderValue: parseFloat(reward.min_order_value || 0)
    };
    
    // Create redemption record
    const redemptionResult = await client.query(`
      INSERT INTO reward_redemption (user_id, reward_id, points_spent, reward_snapshot)
      VALUES ($1, $2, $3, $4)
      RETURNING redemption_id, redeemed_at
    `, [userId, rewardId, reward.points_cost, JSON.stringify(rewardSnapshot)]);
    
    const redemptionId = redemptionResult.rows[0].redemption_id;
    
    // Deduct points
    await client.query(`
      UPDATE user_points 
      SET current_balance = current_balance - $1, updated_at = now()
      WHERE user_id = $2
    `, [reward.points_cost, userId]);
    
    // Record transaction
    await client.query(`
      INSERT INTO point_transaction (user_id, points, transaction_type, redemption_id, description)
      VALUES ($1, $2, 'redeemed', $3, $4)
    `, [userId, -reward.points_cost, redemptionId, `Redeemed: ${reward.reward_name}`]);
    
    await client.query('COMMIT');
    
    const redemption: RewardRedemptionDto = {
      id: redemptionId,
      userId,
      rewardId,
      rewardName: reward.reward_name,
      rewardType: reward.reward_type,
      pointsSpent: reward.points_cost,
      redeemedAt: redemptionResult.rows[0].redeemed_at,
      discountValue: rewardSnapshot.discountValue || undefined
    };
    
    res.status(201).json(redemption);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error redeeming reward:', error);
    res.status(500).json({ error: 'Failed to redeem reward' });
  } finally {
    client.release();
  }
});

// GET /api/loyalty/redemptions - Get user's redemption history
router.get('/redemptions', requiresAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { unused } = req.query;
  
  try {
    let query = `
      SELECT rr.*, r.reward_name, r.reward_type
      FROM reward_redemption rr
      JOIN reward r ON rr.reward_id = r.reward_id
      WHERE rr.user_id = $1
    `;
    
    if (unused === 'true') {
      query += ' AND rr.used_at IS NULL';
    }
    
    query += ' ORDER BY rr.redeemed_at DESC';
    
    const result = await pool.query(query, [userId]);
    const redemptions = result.rows.map(serializeRedemption);
    
    res.json(redemptions);
  } catch (error) {
    console.error('Error fetching redemptions:', error);
    res.status(500).json({ error: 'Failed to fetch redemptions' });
  }
});

// GET /api/loyalty/transactions - Get user's point transaction history
router.get('/transactions', requiresAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const limit = parseInt(req.query.limit as string) || 50;
  
  try {
    const result = await pool.query(`
      SELECT pt.*, p.promotion_name
      FROM point_transaction pt
      LEFT JOIN promotion p ON pt.promotion_id = p.promotion_id
      WHERE pt.user_id = $1
      ORDER BY pt.created_at DESC
      LIMIT $2
    `, [userId, limit]);
    
    const transactions = result.rows.map(serializeTransaction);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// POST /api/loyalty/earn - Award points for an order (called internally when order is placed)
router.post('/earn', requiresAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { orderId, orderTotal } = req.body;
  
  if (!orderId || orderTotal === undefined) {
    return res.status(400).json({ error: 'Order ID and order total are required' });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Verify the order belongs to the user
    const orderResult = await client.query(
      'SELECT order_id, paid_amount FROM "order" WHERE order_id = $1 AND user_id = $2',
      [orderId, userId]
    );
    
    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if points were already awarded for this order
    const existingResult = await client.query(
      'SELECT transaction_id FROM point_transaction WHERE order_id = $1 AND transaction_type = \'earned\'',
      [orderId]
    );
    
    if (existingResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Points already awarded for this order' });
    }
    
    // Calculate base points (1 point per 10 EUR)
    const basePoints = Math.floor(parseFloat(orderTotal) / 10);
    
    if (basePoints <= 0) {
      await client.query('ROLLBACK');
      return res.json({ 
        pointsEarned: 0, 
        basePoints: 0, 
        bonusMultiplier: 1.0, 
        newBalance: 0,
        message: 'Order total too low to earn points'
      });
    }
    
    // Get multiplier from active promotions
    const { multiplier, promotionName } = await getPointsMultiplier();
    const totalPoints = Math.floor(basePoints * multiplier);
    
    // Get active promotion ID if applicable
    let promotionId = null;
    if (multiplier > 1.0) {
      const promoResult = await client.query(`
        SELECT promotion_id FROM promotion 
        WHERE promotion_name = $1 AND is_active = true
        LIMIT 1
      `, [promotionName]);
      promotionId = promoResult.rows[0]?.promotion_id;
    }
    
    // Ensure user points record exists
    await client.query(`
      INSERT INTO user_points (user_id, total_points_earned, current_balance)
      VALUES ($1, 0, 0)
      ON CONFLICT (user_id) DO NOTHING
    `, [userId]);
    
    // Update user points
    await client.query(`
      UPDATE user_points 
      SET total_points_earned = total_points_earned + $1,
          current_balance = current_balance + $1,
          updated_at = now()
      WHERE user_id = $2
    `, [totalPoints, userId]);
    
    // Record transaction
    const description = multiplier > 1.0 
      ? `Earned ${totalPoints} points (${basePoints} base × ${multiplier} bonus)`
      : `Earned ${totalPoints} points for order`;
    
    await client.query(`
      INSERT INTO point_transaction (user_id, points, transaction_type, order_id, promotion_id, description)
      VALUES ($1, $2, 'earned', $3, $4, $5)
    `, [userId, totalPoints, orderId, promotionId, description]);
    
    // Get new balance
    const balanceResult = await client.query(
      'SELECT current_balance FROM user_points WHERE user_id = $1',
      [userId]
    );
    
    await client.query('COMMIT');
    
    const response: PointsEarnedResponseDto = {
      pointsEarned: totalPoints,
      basePoints,
      bonusMultiplier: multiplier,
      promotionApplied: promotionName,
      newBalance: balanceResult.rows[0].current_balance
    };
    
    res.status(201).json(response);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error awarding points:', error);
    res.status(500).json({ error: 'Failed to award points' });
  } finally {
    client.release();
  }
});

// POST /api/loyalty/use-redemption - Mark a redemption as used with an order
router.post('/use-redemption', requiresAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { redemptionId, orderId } = req.body;
  
  if (!redemptionId || !orderId) {
    return res.status(400).json({ error: 'Redemption ID and Order ID are required' });
  }
  
  try {
    // Verify redemption belongs to user and is unused
    const redemptionResult = await pool.query(`
      SELECT * FROM reward_redemption 
      WHERE redemption_id = $1 AND user_id = $2 AND used_at IS NULL
    `, [redemptionId, userId]);
    
    if (redemptionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Redemption not found or already used' });
    }
    
    // Mark as used
    await pool.query(`
      UPDATE reward_redemption 
      SET used_at = now(), order_id = $1
      WHERE redemption_id = $2
    `, [orderId, redemptionId]);
    
    res.json({ success: true, message: 'Redemption marked as used' });
  } catch (error) {
    console.error('Error using redemption:', error);
    res.status(500).json({ error: 'Failed to use redemption' });
  }
});

router.get('/coupon-code/:code', async (req: Request, res: Response) => {
    const code = req.params.code!;
    try {
        const result = await pool.query<CouponCodeRow>(`
            SELECT * FROM coupon_code c
            WHERE c.coupon_code = $1;
        `, [code]);

        if (result.rows.length === 0) {
            sendNotFound(res, "Could not find Coupon Code");
            return;
        }
        res.json(couponCodeSerializer.serialize(result.rows[0]!));

    } catch (error) {
        sendInternalError(res, error, "occurred while fetching coupon code");
    }
})

export default router;
