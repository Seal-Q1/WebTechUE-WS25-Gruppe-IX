import {Component, Inject, inject} from '@angular/core';
import {Dialog, DIALOG_DATA, DialogRef} from '@angular/cdk/dialog';
import {DishReviewDtoToServer, MenuItemWithImageDto, RestaurantReviewDtoToServer} from '@shared/types';
import {ImageDisplay} from '../../../shared/image-display/image-display';
import {AuthService} from '../../../services/auth.service';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faPlus, faStar} from '@fortawesome/free-solid-svg-icons';
import {ReviewModal} from '../../review-modal/review-modal';
import {MenuItemService} from '../../../services/menu-item-service';
import {CartService} from '../../../services/cart-service';

@Component({
  selector: 'app-dish-details',
  imports: [
    ImageDisplay,
    FaIconComponent
  ],
  templateUrl: './dish-details-modal.component.html',
  styleUrl: './dish-details-modal.component.css',
})
export class DishDetailsModal {
  private dialogRef = inject(DialogRef);
  private dialog = inject(Dialog);
  protected authService = inject(AuthService);
  private menuItemService = inject(MenuItemService);
  private cartService = inject(CartService);

  constructor(@Inject(DIALOG_DATA) public data: MenuItemWithImageDto) {};

  openReviewModal() {
    const dialogRef = this.dialog.open(ReviewModal, {disableClose: true});
    dialogRef.closed.subscribe((review) => {
      console.log(review);
      if (review) {
        const reviewDto = review as DishReviewDtoToServer;
        this.menuItemService.submitReview(this.data.menuItemDto.restaurantId, this.data.menuItemDto.id, reviewDto)
      }
    });
  }

  onAddToCart() {
    let currentQuantity = this.cartService.getItemQuantity(this.data.menuItemDto)
    this.cartService.setCartEntry(this.data.menuItemDto, currentQuantity + 1)
  }

  protected readonly faStar = faStar;
  protected readonly faPlus = faPlus;
}
