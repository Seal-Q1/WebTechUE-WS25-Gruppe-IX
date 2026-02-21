import {Component, computed, inject, input} from '@angular/core';
import {CartService} from '../../services/cart-service';
import {CardItem} from './cart-item/cart-item';
import {Dialog} from '@angular/cdk/dialog';
import {CheckoutModal} from '../checkout-modal/checkout-modal.component';

@Component({
  selector: 'app-cart-sidebar',
  imports: [
    CardItem
  ],
  templateUrl: './cart-sidebar.html',
  styleUrl: './cart-sidebar.css',
})
export class CartSidebar {
  restaurantId = input.required<number>();

  cartService = inject(CartService);
  private dialog = inject(Dialog);

  cart = computed(() => {
    return this.cartService.getCart(this.restaurantId());
  })

  checkout() {
    this.dialog.open(CheckoutModal, {data: this.restaurantId()})
  }
}
