import {Serializable} from './serializable.interface';
import {CouponCodeDto} from "@shared/types/coupon-code.dto";

export interface CouponCodeRow {
    coupon_id: number;
    coupon_code: string;
    description: string | null;
    discount_type: string;
    discount_value: number;
    min_order_value: number;
    max_uses: number | null;
    current_uses: number;
    start_date: Date | null;
    end_date: Date | null;
    is_active: boolean;
    restaurant_id: number | null;
    created_at: Date;
}

export class CouponCodeSerializer extends Serializable<CouponCodeRow, CouponCodeDto> {
    serialize(row: CouponCodeRow): CouponCodeDto {
        return {
            id: row.coupon_id,
            couponCode: row.coupon_code,
            description: row.description,
            discountType: row.discount_type,
            discountValue: row.discount_value,
            minOrderValue: row.min_order_value,
            maxUsesReached: (row.max_uses ? row.max_uses : 0) > row.current_uses,
            startDate: row.start_date,
            endDate: row.end_date,
            isActive: row.is_active,
            restaurantId: row.restaurant_id,
        };
    }
}

export const couponCodeSerializer = new CouponCodeSerializer();