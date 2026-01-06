import {Injectable} from '@angular/core';
import {apiUrls} from '../config/api_urls';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class OrderFetchService {
  constructor(private http: HttpClient) {}

  getOrders(restaurantId: number) {
    return this.http.get<any>(apiUrls.orderEndpoint(restaurantId));
  }

  getOrderItems(orderId: number) {
    return this.http.get<any>(apiUrls.orderItemsEndpoint(orderId));
  }
}
