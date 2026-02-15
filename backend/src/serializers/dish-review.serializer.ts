import {Serializable} from './serializable.interface';
import {DishReviewDto} from "@shared/types";

export interface DishReviewRow {
    review_id: number;
    item_id: number;
    user_id: number;
    rating: number;
    review_text: string;
    timestamp: Date;
}

export class DishReviewSerializer extends Serializable<DishReviewRow, DishReviewDto> {
    serialize(row: DishReviewRow): DishReviewDto {
        return {
            id: row.review_id,
            itemId: row.item_id,
            userId: row.user_id,
            rating: row.rating,
            reviewText: row.review_text,
            timestamp: row.timestamp
        };
    }
}

export const dishReviewSerializer = new DishReviewSerializer();