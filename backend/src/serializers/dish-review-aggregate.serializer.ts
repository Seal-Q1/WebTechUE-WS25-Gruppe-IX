import {Serializable} from './serializable.interface';
import {DishReviewAggregateDto} from "@shared/types";

export interface DishReviewAggregateRow {
    item_id: number;
    count: number;
    avg: number;
}

export class DishReviewAggregateSerializer extends Serializable<DishReviewAggregateRow, DishReviewAggregateDto> {
    serialize(row: DishReviewAggregateRow): DishReviewAggregateDto {
        return {
            itemId: row.item_id,
            count: row.count,
            avg: row.avg
        };
    }
}

export const dishReviewAggregateSerializer = new DishReviewAggregateSerializer();