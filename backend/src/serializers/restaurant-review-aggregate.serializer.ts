import {Serializable} from './serializable.interface';
import {RestaurantReviewAggregateDto} from "@shared/types";

export interface RestaurantReviewAggregateRow {
    restaurant_id: number;
    count: number;
    avg: number;
}

export class RestaurantReviewAggregateSerializer extends Serializable<RestaurantReviewAggregateRow, RestaurantReviewAggregateDto> {
    serialize(row: RestaurantReviewAggregateRow): RestaurantReviewAggregateDto {
        return {
            restaurantId: row.restaurant_id,
            count: row.count,
            avg: row.avg
        };
    }
}

export const restaurantReviewAggregateSerializer = new RestaurantReviewAggregateSerializer();