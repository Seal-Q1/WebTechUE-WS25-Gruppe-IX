import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {OrderRequestDto} from '@shared/types';
import {apiUrls} from '../config/api_urls';
import {CartItemDto} from './cart-service';
import {OrderRequestItemDto} from '@shared/types/order-request.dto';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: HttpClient) {}

  placeOrderRequest(cartItems: CartItemDto[]) {
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
      discountCode: ""
    }
    return this.http.post<OrderRequestDto>(apiUrls.placeOrderEndpoint(), orderRequestDto);
  }
}
