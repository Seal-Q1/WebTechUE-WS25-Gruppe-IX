import type {AddressDto} from "@shared/types/address.dto";
import type {PaymentCardDto} from "@shared/types/banking.dto";

export interface OrderRequestDto {
    items: OrderRequestItemDto[],
    restaurantId: number;
    couponCode?: string,
    address: AddressDto,
    card: PaymentCardDto
}

export interface OrderRequestItemDto {
    dishId: number,
    quantity: number
}