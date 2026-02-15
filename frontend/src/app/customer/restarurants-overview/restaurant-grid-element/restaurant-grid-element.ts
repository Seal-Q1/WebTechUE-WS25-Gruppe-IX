import {Component, inject, input} from '@angular/core';
import {RestaurantDto, RestaurantReviewAggregateDto} from '@shared/types';
import {ImageDisplay} from '../../../shared/image-display/image-display';
import {RestaurantService} from '../../../services/restaurant-service';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {switchMap} from 'rxjs';
import {Router} from '@angular/router';
import {StarRating} from '../../star-rating/star-rating';

@Component({
  selector: 'app-restaurant-grid-element',
  imports: [
    ImageDisplay,
    StarRating
  ],
  templateUrl: './restaurant-grid-element.html',
  styleUrl: './restaurant-grid-element.css',
})

export class RestaurantGridElement {
  private router = inject(Router);
  private restaurantService = inject(RestaurantService);

  restaurant = input.required<RestaurantDto>();
  rating = input.required<RestaurantReviewAggregateDto>();

  imageDto = toSignal(
    toObservable(this.restaurant).pipe(
      switchMap(restaurant => this.restaurantService.getRestaurantImage(restaurant.id))
    ),
    { initialValue: null }
  );

  onClick() {
    this.router.navigate([`/restaurant/${this.restaurant().id}`]);
  }
}
