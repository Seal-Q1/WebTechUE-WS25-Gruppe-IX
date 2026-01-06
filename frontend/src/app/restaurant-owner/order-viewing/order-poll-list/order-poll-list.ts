import {Component} from '@angular/core';
import {OrderDto, OrderItemDto, MenuItemDto, OrderStatusEnum} from '@shared/types';
import {OrderFetchService} from '../../../services/order-fetch-service';
import {MenuItemService} from '../../../services/menu-item-service';
import {OrderCardComponent} from '../order-card/order-card';


@Component({
  selector: 'app-order-poll-list',
  templateUrl: './order-poll-list.html',
  styleUrl: './order-poll-list.css',
  imports: [
    OrderCardComponent
  ]
})
export class OrderPollList {
  orders: OrderDto[] = [];
  orderItems: Map<number, OrderItemDto[]> = new Map();
  menuItems: Map<number, MenuItemDto> = new Map();

  private restaurantId = 1; //FIXME remove hardcode

  constructor(
    private orderFetchService: OrderFetchService,
    private menuItemService: MenuItemService
  ) {}

  fetchOrders(): void {
    this.orderFetchService.getAllOrders(this.restaurantId).subscribe(data => {
      this.orders = data;
    });
  }

  fetchOrderItems(orderId: number): void {
    if (this.orderItems.has(orderId)) {
      return;
    }
    this.orderFetchService.getOrderItems(this.restaurantId, orderId).subscribe(data => {
      this.orderItems.set(orderId, data);
    });
  }

  fetchMenuItem(itemId: number): void {
    if (this.menuItems.has(itemId)) {
      return;
    }
    this.menuItemService.getMenuItem(this.restaurantId, itemId).subscribe(data => {
      this.menuItems.set(itemId, data);
    });
  }

  getOrderItems(orderId: number): OrderItemDto[] {
    return this.orderItems.get(orderId) ?? [];
  }

  getMenuItem(itemId: number): MenuItemDto | undefined {
    return this.menuItems.get(itemId);
  }

  }

  }
}
