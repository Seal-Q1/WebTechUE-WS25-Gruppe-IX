export interface OrderRequestDto {
    items: OrderRequestItemDto[],
    discountCode: string
}

export interface OrderRequestItemDto {
    restaurantId: number,
    dishId: number,
    quantity: number
}