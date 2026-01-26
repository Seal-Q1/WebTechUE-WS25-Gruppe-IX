import {Component, inject, input, Input} from '@angular/core';
import {MenuItemDto} from '@shared/types';
import {ImageDisplay} from '../../../shared/image-display/image-display';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {switchMap} from 'rxjs';
import {MenuItemService} from '../../../services/menu-item-service';
import {CartService} from '../../../services/cart-service';

@Component({
  selector: 'app-dish-grid-element',
  imports: [
    ImageDisplay
  ],
  templateUrl: './dish-element.html',
  styleUrl: './dish-element.css',
})
export class DishGridElement {
  private menuItemService = inject(MenuItemService);
  private cartService = inject(CartService);

  dish = input.required<MenuItemDto>();

  imageDto = toSignal(
    toObservable(this.dish).pipe(
      switchMap(restaurant => this.menuItemService.getMenuItemImage(this.dish().restaurantId, this.dish().id))
    ),
    { initialValue: null }
  );

  onAddToCart() {
    let currentQuantity = this.cartService.getItemQuantity(this.dish())
    this.cartService.setCartEntry(this.dish(), currentQuantity + 1)
  }
}
