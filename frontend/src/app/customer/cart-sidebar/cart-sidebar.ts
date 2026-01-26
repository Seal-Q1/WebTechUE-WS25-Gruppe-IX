import {Component, inject} from '@angular/core';
import {CartService} from '../../services/cart-service';
import {CardItem} from '../cart-item/cart-item';

@Component({
  selector: 'app-cart-sidebar',
  imports: [
    CardItem
  ],
  templateUrl: './cart-sidebar.html',
  styleUrl: './cart-sidebar.css',
})
export class CartSidebar {
  cartService = inject(CartService);
}
