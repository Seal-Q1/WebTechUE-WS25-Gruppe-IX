import {Component, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {RestaurantService} from '../../../services/restaurant-service';
import {toSignal} from '@angular/core/rxjs-interop';
import {ImageDisplay} from '../../../shared/image-display/image-display';
import {MenuItemService} from '../../../services/menu-item-service';
import {DishGridElement} from '../dish-element/dish-element';
import {CartSidebar} from '../../cart-sidebar/cart-sidebar';

@Component({
  selector: 'app-restaurant-view',
  imports: [
    ImageDisplay,
    DishGridElement,
    CartSidebar
  ],
  templateUrl: './restaurant-view.component.html',
  styleUrl: './restaurant-view.component.css',
})
export class RestaurantView {
  private route = inject(ActivatedRoute);
  private restaurantService = inject(RestaurantService);
  private menuItemService = inject(MenuItemService);

  restaurantId: number = parseInt(this.route.snapshot.paramMap.get('restaurantId')!);

  restaurant = toSignal(this.restaurantService.getRestaurantProfile(this.restaurantId), { initialValue: null});
  imageDto = toSignal(this.restaurantService.getRestaurantImage(this.restaurantId), { initialValue: null});
  dishes = toSignal(this.menuItemService.getAllMenuItems(this.restaurantId), { initialValue: []});
}
