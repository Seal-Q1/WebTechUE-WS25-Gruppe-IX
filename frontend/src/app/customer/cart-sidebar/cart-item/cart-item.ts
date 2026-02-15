import {Component, inject, input} from '@angular/core';
import {CartItemDto, CartService} from '../../../services/cart-service';

@Component({
  selector: 'app-cart-item',
  imports: [],
  templateUrl: './cart-item.html',
  styleUrl: './cart-item.css',
})
export class CardItem {
  private cartService = inject(CartService);

  cartItem = input.required<CartItemDto>();

  getTotalPrice() {
      return this.cartItem().itemInfo.price * this.cartItem().quantity
  }

  removeItem() {
    let currentQuantity = this.cartItem().quantity;
    this.cartService.setCartEntry(this.cartItem().itemInfo, currentQuantity - 1);
  }

  addItem() {
    let currentQuantity = this.cartItem().quantity;
    this.cartService.setCartEntry(this.cartItem().itemInfo, currentQuantity + 1);
  }
}
