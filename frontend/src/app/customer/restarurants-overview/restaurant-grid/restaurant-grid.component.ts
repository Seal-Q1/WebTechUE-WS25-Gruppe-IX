import {Component, computed, inject, signal} from '@angular/core';
import {RestaurantService} from '../../../services/restaurant-service';
import {RestaurantGridElement} from '../restaurant-grid-element/restaurant-grid-element';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-restaurant-grid',
  imports: [
    RestaurantGridElement
  ],
  templateUrl: './restaurant-grid.component.html',
  styleUrl: './restaurant-grid.component.css',
})
export class RestaurantGrid {
  private restaurantService = inject(RestaurantService);

  restaurants = toSignal(this.restaurantService.getAllRestaurants(), { initialValue: [] });

  nameSearchTerm = signal('');

  filteredRestaurants = computed(() => {
    const searchTerm = this.nameSearchTerm().toLowerCase();
    return this.restaurants().filter((restaurant) => {
      return restaurant.name.toLowerCase().includes(searchTerm);
    });
  })

  onNameSearch(e: Event) {
    const target = e.target as HTMLInputElement;
    this.nameSearchTerm.set(target.value);
  }
}
