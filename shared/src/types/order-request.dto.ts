import type {AddressDto} from "@shared/types/address.dto";
import type {PaymentCardDto} from "@shared/types/banking.dto";

export interface OrderRequestDto {
    items: OrderRequestItemDto[],
    couponCode: string,
    address: AddressDto,
    card: PaymentCardDto
}

export interface OrderRequestItemDto {
    restaurantId: number,
    dishId: number,
    quantity: number
}