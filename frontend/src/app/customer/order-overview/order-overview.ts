import {Component, computed, inject} from '@angular/core';
import {OrderFetchService} from '../../services/order-fetch-service';
import {toSignal} from '@angular/core/rxjs-interop';
import {OrderElement} from './order-element/order-element';

@Component({
  selector: 'app-order-overview',
  imports: [
    OrderElement
  ],
  templateUrl: './order-overview.html',
  styleUrl: './order-overview.css',
})
export class OrderOverview {
  private orderFetchService = inject(OrderFetchService)

  orders = toSignal(this.orderFetchService.getOwnOrders(), { initialValue: [] });
  currentOrders = computed(() => this.orders().filter(
    (order) => {
      return order.status === 'preparing' || order.status === 'ready';
    }
  ))
  pastOrders = computed(() => this.orders().filter(
    (order) => {
      return order.status === 'fulfilled' || order.status === 'cancelled';
    }
  ))
}
