import {OrderDto} from '../../../dtos/order.dto';
import {OrderItemDto} from '../../../dtos/orderItem.dto';
import {Component} from '@angular/core';
import {MenuItemDto} from '../../../dtos/menuItem.dto';
import {OrderFetchService} from '../../../services/order-fetch-service';
import {MenuItemService} from '../../../services/menu-item-service';
import {OrderTypeEnum} from '../../../dtos/orderType.enum';
import {PaymentMethodEnum} from '../../../dtos/paymentMethod.enum';
import {AddressDto} from '../../../dtos/address.dto';
import {OrderStatusEnum} from '../../../dtos/orderStatus.enum';
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
    public orderFetchService: OrderFetchService,
    public menuItemService: MenuItemService
  ) {}


  fetchOrders(): void {
    this.orderFetchService.getOrders(this.restaurantId).subscribe(data => {
      this.orders = this.deserializeOrderData(data);
    });
  }

  fetchOrderItems(orderId: number): void {
    if (this.orderItems.has(orderId)) {
      return;
    }
    this.orderFetchService.getOrderItems(orderId).subscribe(data => {
      this.orderItems.set(orderId, this.deserializeOrderItemData(data));
    });
  }

  fetchMenuItem(itemId: number): void {
    if (this.menuItems.has(itemId)) {
      return;
    }
    this.menuItemService.getMenuItem(itemId).subscribe(data => {
      this.menuItems.set(itemId, this.deserializeMenuItemData(data));
    });
  }

  getOrderItems(orderId: number): OrderItemDto[] {
    return this.orderItems.get(orderId) ?? [];
  }

  getMenuItem(itemId: number): MenuItemDto | undefined {
    return this.menuItems.get(itemId);
  }

  deserializeOrderData(data: Array<object>): OrderDto[] {
      return data.map((order: any): OrderDto => ({
      id: order.id,
      name: order.name,
      type: this.deserializeOrderType(order.type),
      status: this.deserializeOrderStatus(order.status),
      address: this.deserializeOrderType(order.type) == OrderTypeEnum.Delivery ? this.deserializeAddress(order) : undefined,
      paidAmount: order.paid_amount,
      paymentMethod: this.deserializePaymentMethod(order.payment_method),
      couponId: order.coupon_id ?? undefined,
      userId: order.user_id,
      createdAt: new Date(order.created_at)
    }));
  }

  deserializeOrderItemData(data: Array<object>): OrderItemDto[] {
    return data.map((item: any): OrderItemDto => ({
      id: item.id,
      itemId: item.item_id,
      quantity: item.quantity,
      unitPrice: item.unit_price
    }));
  }

  deserializeMenuItemData(data: any): MenuItemDto {
    return {
      id: data.id,
      name: data.item_name,
      price: data.item_price,
      description: data.item_description ?? undefined
    };
  }

  private deserializeOrderType(order_type: any): OrderTypeEnum {
    return order_type as OrderTypeEnum;
  }

  private deserializePaymentMethod(payment_method: any): PaymentMethodEnum {
    return payment_method as PaymentMethodEnum;
  }

  private deserializeAddress(o: any): AddressDto {
    return {
      street: o.address_street,
      houseNumber: o.address_houseNumber,
      postalCode: o.address_postalCode,
      city: o.address_city,
      door: o.address_door
    };
  }

  private deserializeOrderStatus(order_status: any): OrderStatusEnum {
    return order_status as OrderStatusEnum;
  }
}
