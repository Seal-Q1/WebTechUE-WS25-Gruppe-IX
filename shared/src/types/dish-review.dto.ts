export interface DishReviewDto {
    id: number;
    itemId: number;
    userId: number;
    rating: number;
    reviewText: string;
    timestamp: Date;
}

export interface DishReviewDtoToServer {
    rating: number;
    reviewText: string;
}

export interface AggregateDishReviewDto {
    itemId: number;
    rating: number;
    count: number;
}