import {Component, computed, inject, signal, WritableSignal} from '@angular/core';
import {DIALOG_DATA} from '@angular/cdk/dialog';
import {MenuItemDto, OrderDto, OrderItemDto} from '@shared/types';
import {MenuItemService} from '../../../services/menu-item-service';
import {OrderFetchService} from '../../../services/order-fetch-service';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {forkJoin, map, of, switchMap} from 'rxjs';

@Component({
  selector: 'app-order-details-modal',
  imports: [],
  templateUrl: './order-details-modal.html',
  styleUrl: './order-details-modal.css',
})
export class OrderDetailsModal {
  order = inject<OrderDto>(DIALOG_DATA);

  private orderFetchService = inject(OrderFetchService);
  private menuItemService = inject(MenuItemService);

  private orderItems = toSignal(this.orderFetchService.getOrderItems(this.order.restaurantId, this.order.id), {initialValue: []})
  orderItemData = toSignal(
    toObservable(this.orderItems).pipe(
      switchMap(orderItems => {
        if (orderItems.length === 0) return of([]);

        const requests = orderItems.map(orderItem =>
          this.menuItemService.getMenuItem(this.order.restaurantId, orderItem.itemId).pipe(
            map(menuItem => ({orderItem: orderItem, menuItem: menuItem} as OrderItemData))
          )
        );

        return forkJoin(requests);
      })
    )
  , {initialValue: []});
}

interface OrderItemData {
  orderItem: OrderItemDto,
  menuItem: MenuItemDto
}
