import {Component, input} from '@angular/core';
import {CartItemDto} from '../../services/cart-service';

@Component({
  selector: 'app-cart-item',
  imports: [],
  templateUrl: './cart-item.html',
  styleUrl: './cart-item.css',
})
export class CardItem {
  cartItem = input.required<CartItemDto>();

  getTotalPrice() {
      return this.cartItem().itemInfo.price * this.cartItem().quantity
  }
}
