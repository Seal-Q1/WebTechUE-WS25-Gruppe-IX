import {Injectable} from '@angular/core';
import {apiUrls} from '../config/api_urls';
import {HttpClient} from '@angular/common/http';
import {OrderDto, OrderItemDto, OrderStatusEnum} from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class OrderFetchService {
  constructor(private http: HttpClient) {}

  getAllOrders(restaurantId: number) {
    return this.http.get<OrderDto[]>(apiUrls.allOrdersEndpoint(restaurantId));
  }

  getOrder(restaurantId: number, orderId: number) {
    return this.http.get<OrderDto>(apiUrls.orderEndpoint(restaurantId, orderId));
  }

  getOrderItems(restaurantId: number, orderId: number) {
    return this.http.get<OrderItemDto[]>(apiUrls.orderItemsEndpoint(restaurantId, orderId));
  }

  updateOrderStatus(restaurantId: number, orderId: number, status: OrderStatusEnum) {
    return this.http.patch<OrderDto>(apiUrls.orderStatusEndpoint(restaurantId, orderId), { status });
  }

  deleteOrder(restaurantId: number, orderId: number) {
    return this.http.delete<void>(apiUrls.orderEndpoint(restaurantId, orderId));
  }
}
