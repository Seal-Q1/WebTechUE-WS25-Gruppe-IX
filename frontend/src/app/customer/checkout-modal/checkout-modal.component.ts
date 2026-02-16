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
  discountErrorMessage = signal<string | null>(null);

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
    this.discountErrorMessage.set(null);
  }

  discountSubmitted() {
    if (!this.couponCode || this.couponCode.trim() === "") {
      this.discountError.set(true);
      this.discountErrorMessage.set("Please enter a discount code.");
      this.activeDiscount.set("");
      this.effectiveDiscount.set(0);
      return;
    }
    this.orderService.getCouponCode(this.couponCode).subscribe({
      next: (res) => {
        // Immediate client-side min order check for better UX
        const cartTotal = this.cartService.getTotalPrice();
        if (res.minOrderValue && cartTotal < res.minOrderValue) {
          this.discountError.set(true);
          this.discountErrorMessage.set(`This coupon requires a minimum order of €${res.minOrderValue}. It has not been applied.`);
          // clear coupon input and any applied discount
          this.couponCode = '';
          this.activeDiscount.set('');
          this.effectiveDiscount.set(0);
          return;
        }

        if (res.discountType === 'fixed') {
          this.effectiveDiscount.set(res.discountValue * 1);
        } else {
          this.effectiveDiscount.set(this.cartService.getTotalPrice() * res.discountValue * 0.01);
        }
        this.activeDiscount.set(res.couponCode);
        this.discountError.set(false);
        this.discountErrorMessage.set(null);
      },
      error: (err) => {
        this.activeDiscount.set('');
        this.effectiveDiscount.set(0);
        this.discountError.set(true);
        // show backend error message if provided
        const be = err?.error;
        const msg = be?.message || be?.error || JSON.stringify(be) || 'Invalid coupon';
        this.discountErrorMessage.set(msg);
        // clear coupon input so user doesn't keep trying
        this.couponCode = '';
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
        this.cartService.clearCart();
      },
      error: (err) => {
        // If backend returns minimum-order error for the coupon, show a clear message and clear the input
        const backendError = err?.error;
        const structuredErrors = ['coupon_min_order','coupon_not_found','coupon_inactive','coupon_expired','coupon_exhausted'];
        if (structuredErrors.includes(backendError?.error)) {
          this.discountError.set(true);
          this.discountErrorMessage.set(backendError?.message || 'Coupon invalid');
          // clear coupon input and applied discount
          this.couponCode = '';
          this.activeDiscount.set('');
          this.effectiveDiscount.set(0);
          return;
        }

        alert("Order could not be placed! Please try again!");
      }
    });
  }

  protected readonly console = console;
}
