import {Component, computed, inject, signal, WritableSignal} from '@angular/core';
import {RestaurantService} from '../../../services/restaurant-service';
import {RestaurantGridElement} from '../restaurant-grid-element/restaurant-grid-element';
import {toSignal} from '@angular/core/rxjs-interop';
import {CuisineDto, RestaurantReviewAggregateDto} from '@shared/types';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faFilter, faPizzaSlice, faStar, faTruckFast} from '@fortawesome/free-solid-svg-icons';
import {GeolocationService} from '../../../services/geolocation-service';
import {CuisineService} from '../../../services/cuisine-service';

@Component({
  selector: 'app-restaurant-grid',
  imports: [
    RestaurantGridElement,
    FaIconComponent
  ],
  templateUrl: './restaurant-grid.component.html',
  styleUrl: './restaurant-grid.component.css',
})
export class RestaurantGrid {
  private restaurantService = inject(RestaurantService);
  private geolocationService = inject(GeolocationService);
  private cuisineService = inject(CuisineService);

  restaurants = toSignal(this.restaurantService.getAllRestaurants(), { initialValue: [] });
  restaurantRatings = toSignal(this.restaurantService.getAggregatedReviews(), { initialValue: [] });
  restaurantCuisineMap = toSignal(this.cuisineService.getCuisineRestaurantMap(), { initialValue: [] });
  cuisines = toSignal(this.cuisineService.getAllCuisines(), { initialValue: [] });

  restrIdToRatingMap = computed(() => {
    const map: Map<number, RestaurantReviewAggregateDto> = new Map();

    for (const rating of this.restaurantRatings()) {
      map.set(rating.restaurantId, rating);
    }

    for (const restaurant of this.restaurants()) {
      if(!map.has(restaurant.id)) {
        const noReview: RestaurantReviewAggregateDto = {
          restaurantId: restaurant.id,
          avg: 0,
          count: 0
        }
        map.set(restaurant.id, noReview);
      }
    }
    return map;
  });

  restrIdToCuisinesMap = computed(() => {
    const map: Map<number, CuisineDto[]> = new Map();

    for(const cuisineMapping of this.restaurantCuisineMap()) {
      const cuisineDto = this.cuisines().find(el => {
        return cuisineMapping.cuisineId === el.id;
      })

      if(!map.has(cuisineMapping.restaurantId)) {
        map.set(cuisineMapping.restaurantId, []);
      }

      const restaurantCuisines = map.get(cuisineMapping.restaurantId)!;
      if(cuisineDto) {
        restaurantCuisines.push(cuisineDto);
      }
    }

    return map;
  })

  advancedFilters = signal(false);
  nameSearchTerm = signal('');
  minStars = signal(0);
  maxDeliveryTime: WritableSignal<number | undefined> = signal(undefined);
  cuisineFilter: WritableSignal<number[]> = signal([]);

  filteredRestaurants = computed(() => {
    const searchTerm = this.nameSearchTerm().toLowerCase();
    return this.restaurants()
      .filter((restaurant) => {
        return restaurant.name.toLowerCase().includes(searchTerm);
      })
      .filter((restaurant) => {
        const rating = this.restrIdToRatingMap().get(restaurant.id)!;
        return rating.avg >= this.minStars();
      })
      .filter((restaurant) => {
        const deliveryTime = this.geolocationService.getDeliveryEstimateFromMe(restaurant.address.coordinates!);
        if(deliveryTime !== undefined && this.maxDeliveryTime() !== undefined) {
          return Math.round(deliveryTime) <= this.maxDeliveryTime()!;
        }
        return true;
      })
      .filter((restaurant) => {
        if(this.cuisineFilter().length === 0) {
          return true;
        }
        const restaurantCuisines = this.restrIdToCuisinesMap().get(restaurant.id) ?? [];
        const restaurantCuisineIds = restaurantCuisines.map(c => c.id);
        for(const searchedCuisine of this.cuisineFilter()) {
          if(restaurantCuisineIds.includes(searchedCuisine)) {
            return true;
          }
        }
        return false;
      });
  })

  toggleAdvancedFilters() {
    this.advancedFilters.set(!this.advancedFilters());
  }

  onNameSearch(e: Event) {
    const target = e.target as HTMLInputElement;
    this.nameSearchTerm.set(target.value);
  }

  onMinStarsSet(e: Event) {
    const target = e.target as HTMLInputElement;
    let value = parseInt(target.value);
    if(isNaN(value)) {
      value = 0;
    }
    this.minStars.set(value);
  }

  onMaxDeliveryTimeSet(e: Event) {
    const target = e.target as HTMLInputElement;
    let value: number | undefined = parseInt(target.value);
    if(isNaN(value)) {
      value = undefined;
    }
    this.maxDeliveryTime.set(value);
  }

  onCuisineFilterSet(e: Event) {
    const target = e.target as HTMLSelectElement;
    let selectedIds: number[] = [];
    for(const option of target.selectedOptions) {
      selectedIds.push(parseInt(option.value));
    }
    this.cuisineFilter.set(selectedIds);
  }

  getRestaurantRating(restaurantId: number) {
    return this.restrIdToRatingMap().get(restaurantId) ?? {
      restaurantId: restaurantId,
      count: 0,
      avg: 0
    };
  }

  getRestaurantCuisines(restaurantId: number) {
    return this.restrIdToCuisinesMap().get(restaurantId) ?? [];
  }

  protected readonly faFilter = faFilter;
  protected readonly faStar = faStar;
  protected readonly faTruckFast = faTruckFast;
  protected readonly faPizzaSlice = faPizzaSlice;
}
