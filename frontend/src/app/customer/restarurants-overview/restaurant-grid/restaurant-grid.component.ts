import { Component, inject } from '@angular/core';
import {RestaurantDto} from '@shared/types';
import {RestaurantService} from '../../../services/restaurant-service';
import {Router} from '@angular/router';
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
}
