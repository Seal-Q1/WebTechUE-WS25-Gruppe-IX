import {Component, computed, inject, input} from '@angular/core';
import {RestaurantDto, RestaurantReviewAggregateDto} from '@shared/types';
import {ImageDisplay} from '../../../shared/image-display/image-display';
import {RestaurantService} from '../../../services/restaurant-service';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {switchMap} from 'rxjs';
import {Router} from '@angular/router';
import {StarRating} from '../../star-rating/star-rating';
import {DistanceBadge} from '../../distance-badge/distance-badge';
import {GeolocationService} from '../../../services/geolocation-service';
import {DeliveryEstimateBadge} from '../../delivery-estimate-badge/delivery-estimate-badge';

@Component({
  selector: 'app-restaurant-grid-element',
  imports: [
    ImageDisplay,
    StarRating,
    DistanceBadge,
    DeliveryEstimateBadge
  ],
  templateUrl: './restaurant-grid-element.html',
  styleUrl: './restaurant-grid-element.css',
})

export class RestaurantGridElement {
  private router = inject(Router);
  private restaurantService = inject(RestaurantService);
  private geolocationService = inject(GeolocationService);

  restaurant = input.required<RestaurantDto>();
  rating = input.required<RestaurantReviewAggregateDto>();
  distance = computed(() => {
    const coordinates = this.restaurant().address.coordinates!;
    return this.geolocationService.getDistanceFromMe(coordinates);
  });
  deliveryEstimate = computed(() => {
    const coordinates = this.restaurant().address.coordinates!;
    return this.geolocationService.getDeliveryEstimateFromMe(coordinates);
  })

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
