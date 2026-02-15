export interface CouponCodeDto {
    id: number;
    couponCode: string;
    description: string | null;
    discountType: string;
    discountValue: number;
    minOrderValue: number;
    maxUsesReached: boolean;
    startDate: Date | null;
    endDate: Date | null;
    isActive: boolean;
    restaurantId: number | null;
}