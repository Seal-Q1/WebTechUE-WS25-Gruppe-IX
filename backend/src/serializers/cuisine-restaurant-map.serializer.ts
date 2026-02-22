import {CuisineRestaurantMapDto} from "@shared/types/cuisine.dto";
import {Serializable} from "./serializable.interface";

export interface CuisineRestaurantMapRow {
    restaurant_id: number;
    cuisine_id: number;
}

export class CuisineRestaurantMapSerializer extends Serializable<CuisineRestaurantMapRow, CuisineRestaurantMapDto> {
    serialize(row: CuisineRestaurantMapRow): CuisineRestaurantMapDto {
        return {
            restaurantId: row.restaurant_id,
            cuisineId: row.cuisine_id
        };
    }
}

export const cuisineRestaurantMapSerializer = new CuisineRestaurantMapSerializer();