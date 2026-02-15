import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AddressDto, CouponCodeDto, OrderRequestDto, PaymentCardDto, RestaurantDto} from '@shared/types';
import {apiUrls} from '../config/api_urls';
import {CartItemDto} from './cart-service';
import {OrderRequestItemDto} from '@shared/types/order-request.dto';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: HttpClient) {}

  private authService = inject(AuthService)

  placeOrderRequest(cartItems: CartItemDto[], address: AddressDto, card: PaymentCardDto, couponCode?: string) {
    let orderRequestItems: OrderRequestItemDto[] = []
    for (const order of cartItems) {
      orderRequestItems.push({
        restaurantId: order.itemInfo.restaurantId,
        dishId: order.itemInfo.id,
        quantity: order.quantity
      })
    }
    let orderRequestDto: OrderRequestDto = {
      items: orderRequestItems,
      address: address,
      card: card
    };
    if (couponCode && couponCode.trim() !== "") {
      orderRequestDto.couponCode = couponCode;
    }
    return this.http.post<OrderRequestDto>(apiUrls.placeOrderEndpoint(), orderRequestDto, this.authService.getAuthHeader());
  }

  getCouponCode(couponCode: string) {
    return this.http.get<CouponCodeDto>(apiUrls.couponCodeEndpoint(couponCode));
  }
}
