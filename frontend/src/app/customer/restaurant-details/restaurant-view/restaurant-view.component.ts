import {Component, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {RestaurantService} from '../../../services/restaurant-service';
import {toSignal} from '@angular/core/rxjs-interop';
import {ImageDisplay} from '../../../shared/image-display/image-display';
import {MenuItemService} from '../../../services/menu-item-service';
import {DishGridElement} from '../dish-element/dish-element';
import {CartSidebar} from '../../cart-sidebar/cart-sidebar';
import {AuthService} from '../../../services/auth.service';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faStar} from '@fortawesome/free-solid-svg-icons';
import {Dialog} from '@angular/cdk/dialog';
import {ReviewModal} from '../../review-modal/review-modal';
import {RestaurantReviewDto, RestaurantReviewDtoToServer} from '@shared/types';

@Component({
  selector: 'app-restaurant-view',
  imports: [
    ImageDisplay,
    DishGridElement,
    CartSidebar,
    FaIconComponent
  ],
  templateUrl: './restaurant-view.component.html',
  styleUrl: './restaurant-view.component.css',
})
export class RestaurantView {
  private route = inject(ActivatedRoute);
  private dialog = inject(Dialog);
  private restaurantService = inject(RestaurantService);
  private menuItemService = inject(MenuItemService);
  authService = inject(AuthService);

  restaurantId: number = parseInt(this.route.snapshot.paramMap.get('restaurantId')!);

  restaurant = toSignal(this.restaurantService.getRestaurantProfile(this.restaurantId), { initialValue: null});
  imageDto = toSignal(this.restaurantService.getRestaurantImage(this.restaurantId), { initialValue: null});
  dishes = toSignal(this.menuItemService.getAllMenuItems(this.restaurantId), { initialValue: []});

  openReviewModal() {
    const dialogRef = this.dialog.open(ReviewModal, {disableClose: true});
    dialogRef.closed.subscribe((review) => {
      console.log(review);
      if (review) {
        const reviewObj = review as RestaurantReviewDtoToServer;
        const reviewDto: RestaurantReviewDtoToServer = {
          rating: reviewObj.rating,
          reviewText: reviewObj.reviewText,
        }
        this.restaurantService.submitReview(this.restaurantId, reviewDto)
      }
    });
  }

  protected readonly faStar = faStar;
}
