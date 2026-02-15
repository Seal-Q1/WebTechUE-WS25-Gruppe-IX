import {Serializable} from './serializable.interface';
import {RestaurantReviewDto} from "@shared/types";

export interface RestaurantReviewRow {
    review_id: number;
    restaurant_id: number;
    user_id: number;
    rating: number;
    review_text: string;
    timestamp: Date;
}

export class RestaurantReviewSerializer extends Serializable<RestaurantReviewRow, RestaurantReviewDto> {
    serialize(row: RestaurantReviewRow): RestaurantReviewDto {
        return {
            id: row.review_id,
            restaurantId: row.restaurant_id,
            userId: row.user_id,
            rating: row.rating,
            reviewText: row.review_text,
            timestamp: row.timestamp
        };
    }
}

export const restaurantReviewSerializer = new RestaurantReviewSerializer();