export interface RestaurantReviewDto {
    id: number;
    restaurantId: number;
    userId: number;
    rating: number;
    reviewText: string;
    timestamp: Date;
}

export interface RestaurantReviewDtoToServer {
    rating: number;
    reviewText: string;
}

export interface RestaurantReviewAggregateDto {
    restaurantId: number;
    count: number;
    avg: number;
}