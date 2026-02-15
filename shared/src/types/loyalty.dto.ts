// Loyalty & Rewards System DTOs

export type RewardType = 'fixed_discount' | 'percentage_discount' | 'free_product';
export type PointTransactionType = 'earned' | 'redeemed' | 'expired' | 'bonus' | 'adjustment';

export interface UserPointsDto {
  userId: number;
  totalPointsEarned: number;
  currentBalance: number;
  updatedAt: string;
}

export interface PromotionDto {
  id: number;
  name: string;
  description?: string | undefined;
  multiplier: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableDays?: number[] | undefined; // 0=Sunday, 1=Monday, ..., 6=Saturday
}

export interface RewardDto {
  id: number;
  name: string;
  description?: string | undefined;
  rewardType: RewardType;
  pointsCost: number;
  discountValue?: number | undefined;
  menuItemId?: number | undefined;
  menuItemName?: string | undefined; // For free_product rewards
  minOrderValue: number;
  validFrom?: string | undefined;
  validUntil?: string | undefined;
  isActive: boolean;
  isLimitedTime: boolean;
  canAfford?: boolean | undefined; // Calculated based on user's balance
}

export interface PointTransactionDto {
  id: number;
  userId: number;
  points: number;
  transactionType: PointTransactionType;
  orderId?: number | undefined;
  promotionId?: number | undefined;
  promotionName?: string | undefined;
  redemptionId?: number | undefined;
  description?: string | undefined;
  createdAt: string;
}

export interface RewardRedemptionDto {
  id: number;
  userId: number;
  rewardId: number;
  rewardName: string;
  rewardType: RewardType;
  pointsSpent: number;
  orderId?: number | undefined;
  redeemedAt: string;
  usedAt?: string | undefined;
  discountValue?: number | undefined;
  couponCode?: string | undefined;
}

// Request DTOs
export interface RedeemRewardRequestDto {
  rewardId: number;
}

export interface UseRewardRequestDto {
  redemptionId: number;
  orderId: number;
}

// Response DTOs
export interface LoyaltyDashboardDto {
  points: UserPointsDto;
  activePromotions: PromotionDto[];
  availableRewards: RewardDto[];
  recentTransactions: PointTransactionDto[];
  pendingRedemptions: RewardRedemptionDto[];
}

export interface PointsEarnedResponseDto {
  pointsEarned: number;
  basePoints: number;
  bonusMultiplier: number;
  promotionApplied?: string | undefined;
  newBalance: number;
}
