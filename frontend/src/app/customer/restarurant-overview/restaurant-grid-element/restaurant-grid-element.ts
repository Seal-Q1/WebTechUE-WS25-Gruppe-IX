import {Component, inject, input, Input} from '@angular/core';
import {ImageDto, RestaurantDto} from '@shared/types';
import {ImageDisplay} from '../../../shared/image-display/image-display';
import {RestaurantService} from '../../../services/restaurant-service';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {switchMap} from 'rxjs';

@Component({
  selector: 'app-restaurant-grid-element',
  imports: [
    ImageDisplay
  ],
  templateUrl: './restaurant-grid-element.html',
  styleUrl: './restaurant-grid-element.css',
})

export class RestaurantGridElement {
  private restaurantService = inject(RestaurantService);

  restaurant = input.required<RestaurantDto>();

  imageDto = toSignal(
    toObservable(this.restaurant).pipe(
      switchMap(restaurant => this.restaurantService.getRestaurantImage(restaurant.id))
    ),
    { initialValue: null }
  );
}
