import {Component, inject, signal, WritableSignal} from '@angular/core';
import {Dialog, DIALOG_DATA, DialogRef} from '@angular/cdk/dialog';
import {
  DishReviewAggregateDto, DishReviewDto,
  DishReviewDtoToServer,
  MenuItemWithImageDto,
} from '@shared/types';
import {ImageDisplay} from '../../../shared/image-display/image-display';
import {AuthService} from '../../../services/auth.service';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faPlus, faStar} from '@fortawesome/free-solid-svg-icons';
import {WriteReviewModal} from '../../write-review-modal/write-review-modal.component';
import {MenuItemService} from '../../../services/menu-item-service';
import {CartService} from '../../../services/cart-service';
import {Review} from '../../review/review';
import {toSignal} from '@angular/core/rxjs-interop';
import {StarRating} from '../../star-rating/star-rating';

@Component({
  selector: 'app-dish-details',
  imports: [
    ImageDisplay,
    FaIconComponent,
    Review,
    StarRating
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


  data = inject<MenuItemWithImageDto>(DIALOG_DATA);
  dishReviews: WritableSignal<DishReviewDto[]> = signal([])

  ngOnInit() {
    this.refreshReviews();
  }

  refreshReviews() {
    this.menuItemService.getReviews(this.data.menuItemDto.restaurantId, this.data.menuItemDto.id).subscribe((reviews) => {
      this.dishReviews.set(reviews);
    });
  }

  getDishRating() {
    let ratingSum = 0;
    let count = 0;
    for(let rating of this.dishReviews()) {
      ratingSum += rating.rating;
      count += 1;
    }
    const rating: DishReviewAggregateDto = {
      itemId: this.data.menuItemDto.id,
      count: count,
      avg: ratingSum/count
    }
    return rating;
  }

  openReviewModal() {
    const dialogRef = this.dialog.open(WriteReviewModal, {disableClose: true});
    dialogRef.closed.subscribe((review) => {
      if (review) {
        const reviewDto = review as DishReviewDtoToServer;
        this.menuItemService.submitReview(this.data.menuItemDto.restaurantId, this.data.menuItemDto.id, reviewDto).add(() => {
            this.refreshReviews();
        });
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
