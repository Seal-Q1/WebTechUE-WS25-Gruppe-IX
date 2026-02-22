import {Component, computed, inject, input, Input, signal, WritableSignal} from '@angular/core';
import {OrderDto} from '@shared/types';
import {GeolocationService} from '../../../services/geolocation-service';
import {RestaurantService} from '../../../services/restaurant-service';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {switchMap} from 'rxjs';

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

  deliveryEstimate: WritableSignal<number | undefined> = signal(undefined);

  ngOnInit() {
    this.restaurantService.getRestaurantProfile(this.order().restaurantId).subscribe(restaurant => {
      this.deliveryEstimate.set(this.geolocationService.getDeliveryEstimate(restaurant.address.coordinates!, this.order().address.coordinates!))
    });
  }
}
