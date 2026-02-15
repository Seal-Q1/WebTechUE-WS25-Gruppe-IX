import {Component, effect, inject, signal} from '@angular/core';
import {OrderService} from '../../services/order-service';
import {CartService} from '../../services/cart-service';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {toSignal} from '@angular/core/rxjs-interop';
import {AddressSelection} from './address-selection/address-selection';
import {PaymentCardDto, UserAddressDto} from '@shared/types';
import {PaymentSelection} from './payment-selection/payment-selection.component';
import {DialogRef} from '@angular/cdk/dialog';

@Component({
  selector: 'app-checkout',
  imports: [
    AddressSelection,
    PaymentSelection
  ],
  templateUrl: './checkout-modal.component.html',
  styleUrl: './checkout-modal.component.css',
})
export class CheckoutModal {
  router = inject(Router);
  dialogRef = inject(DialogRef);
  cartService = inject(CartService);
  orderService = inject(OrderService);
  authService = inject(AuthService);

  user = toSignal(this.authService.getCurrentUser(), { initialValue: null });
  address= signal<UserAddressDto | null>(null);
  card= signal<PaymentCardDto | null>(null);
  couponCode: string = "";

  activeDiscount = signal("");
  effectiveDiscount = signal(0);
  discountError = signal(false);

  // Sets default address + card
  constructor() {
    effect(() => {
      const currentUser = this.user();
      if (currentUser) {
        if (currentUser.addresses.length > 0) {
          this.address.set(currentUser.addresses[0]);
        }

        if (currentUser.paymentCards.length > 0) {
          this.card.set(currentUser.paymentCards[0]);
        }
      }
    });
  }

  addressSelected(address: UserAddressDto) {
    this.address.set(address);
    console.log(this.address);
  }

  cardSelected(card: PaymentCardDto) {
    this.card.set(card);
    console.log(this.card);
  }

  discountEntered(event: Event) {
    const target = event.target as HTMLInputElement;
    this.couponCode = target.value;
    this.discountError.set(false);
  }

  discountSubmitted() {
    this.orderService.getCouponCode(this.couponCode).subscribe({
      next: (res) => {
        if (res.discountType === 'fixed') {
          this.effectiveDiscount.set(res.discountValue * 1); // workaround, for some reason I get an error if I don't multiply this
        } else {
          this.effectiveDiscount.set(this.cartService.getTotalPrice() * res.discountValue * 0.01);
        }
        this.activeDiscount.set(res.couponCode);
      },
      error: () => {
        this.activeDiscount.set('');
        this.effectiveDiscount.set(0);
        this.discountError.set(true);
      }
    });
  }

  placeOrder() {
    const orders = this.cartService.cart();
    this.orderService.placeOrderRequest(orders, this.address()!.address, this.card()!, this.couponCode).subscribe({
      next: (data) => {
        this.cartService.clearCart();
        this.router.navigate([`/order-confirmation`]);
        this.dialogRef.close();
      },
      error: () => {
        alert("Order could not be placed! Please try again!");
      }
    });
  }

  protected readonly console = console;
}
