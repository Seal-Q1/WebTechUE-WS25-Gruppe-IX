export interface CuisineDto {
  id: number;
  name: string;
  description?: string;
  emoji?: string;
  orderIndex: number;
}

export interface CuisineRestaurantMapDto {
    cuisineId: number;
    restaurantId: number;
}