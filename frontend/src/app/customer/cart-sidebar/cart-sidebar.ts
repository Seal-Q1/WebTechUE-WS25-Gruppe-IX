import {Component, inject} from '@angular/core';
import {CartService} from '../../services/cart-service';
import {CardItem} from '../cart-item/cart-item';
import {Router} from '@angular/router';
import {OrderService} from '../../services/order-service';

@Component({
  selector: 'app-cart-sidebar',
  imports: [
    CardItem
  ],
  templateUrl: './cart-sidebar.html',
  styleUrl: './cart-sidebar.css',
})
export class CartSidebar {
  router = inject(Router);
  cartService = inject(CartService);
  orderService = inject(OrderService)

  placeOrder() {
    const orders = this.cartService.cart()
    this.orderService.placeOrderRequest(orders).subscribe(data => {
      this.cartService.clearCart();
      this.router.navigate([`/order-confirmation`]);
    })
  }
}
