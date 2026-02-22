import {Component, inject, input, Input, signal, WritableSignal} from '@angular/core';
import {OrderDto} from '@shared/types';
import {GeolocationService} from '../../../services/geolocation-service';
import {RestaurantService} from '../../../services/restaurant-service';
import {DishDetailsModal} from '../../restaurant-details/dish-details-modal/dish-details-modal.component';
import {Dialog} from '@angular/cdk/dialog';
import {OrderDetailsModal} from '../order-details-modal/order-details-modal';

@Component({
  selector: 'app-order-element',
  imports: [],
  templateUrl: './order-element.html',
  styleUrl: './order-element.css',
})
export class OrderElement {
  order = input.required<OrderDto>();
  @Input() showDeliveryEstimate: boolean = false;

  private geolocationService = inject(GeolocationService);
  private restaurantService = inject(RestaurantService);
  private dialog = inject(Dialog);

  deliveryEstimate: WritableSignal<number | undefined> = signal(undefined);

  ngOnInit() {
    this.restaurantService.getRestaurantProfile(this.order().restaurantId).subscribe(restaurant => {
      this.deliveryEstimate.set(this.geolocationService.getDeliveryEstimate(restaurant.address.coordinates!, this.order().address.coordinates!))
    });
  }

  openOrderDetailsModal() {
    const dialogRef = this.dialog.open(OrderDetailsModal, {
      data: this.order()
    });
  }
}
