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

  orderItems = toSignal(this.orderFetchService.getOrderItemsWithDetails(this.order.restaurantId, this.order.id), {initialValue: []})
}
