import {Component, computed, inject, signal, WritableSignal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {RestaurantService} from '../../../services/restaurant-service';
import {toSignal} from '@angular/core/rxjs-interop';
import {ImageDisplay} from '../../../shared/image-display/image-display';
import {MenuItemService} from '../../../services/menu-item-service';
import {DishGridElement} from '../dish-element/dish-element';
import {CartSidebar} from '../../cart-sidebar/cart-sidebar';
import {AuthService} from '../../../services/auth.service';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faCartShopping, faStar, faXmark} from '@fortawesome/free-solid-svg-icons';
import {Dialog} from '@angular/cdk/dialog';
import {WriteReviewModal} from '../../write-review-modal/write-review-modal.component';
import {
  DishReviewAggregateDto, RestaurantReviewAggregateDto, RestaurantReviewDto,
  RestaurantReviewDtoToServer
} from '@shared/types';
import {StarRating} from '../../star-rating/star-rating';
import {ShowReviewsModal} from '../show-reviews-modal/show-reviews-modal';
import {CartService} from '../../../services/cart-service';
import {GeolocationService} from '../../../services/geolocation-service';
import {DistanceBadge} from '../../distance-badge/distance-badge';
import {MapModal} from '../map-modal/map-modal';

@Component({
  selector: 'app-restaurant-view',
  imports: [
    ImageDisplay,
    DishGridElement,
    CartSidebar,
    FaIconComponent,
    StarRating,
    DistanceBadge
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
  cartService = inject(CartService);
  geolocationService = inject(GeolocationService);

  restaurantId: number = parseInt(this.route.snapshot.paramMap.get('restaurantId')!);

  restaurant = toSignal(this.restaurantService.getRestaurantProfile(this.restaurantId), { initialValue: null});
  restaurantReviews: WritableSignal<RestaurantReviewDto[]> = signal([]);
  menuItemRatings = toSignal(this.menuItemService.getAggregatedReviews(this.restaurantId), { initialValue: [] });
  imageDto = toSignal(this.restaurantService.getRestaurantImage(this.restaurantId), { initialValue: null});
  dishes = toSignal(this.menuItemService.getAllMenuItems(this.restaurantId), { initialValue: []});

  distance = computed(() => {
    const coordinates = this.restaurant()?.address.coordinates;
    if(coordinates) {
      return this.geolocationService.getDistanceFromMe(coordinates);
    }
    return undefined;
  })
  cartShown = signal(this.cartService.getCart(this.restaurantId).length > 0);


  ngOnInit() {
    this.refreshReviews();
  }

  refreshReviews() {
    this.restaurantService.getReviews(this.restaurantId).subscribe((reviews) => {
      this.restaurantReviews.set(reviews);
    });
  }

  getMenuItemRating(itemId: number) {
    for(let rating of this.menuItemRatings()) {
      if(itemId === rating.itemId) {
        return rating;
      }
    }
    const noRating: DishReviewAggregateDto = {
      itemId: itemId,
      count: 0,
      avg: 0
    }
    return noRating;
  }

  getRestaurantRating() {
    let ratingSum = 0;
    let count = 0;
    for(let rating of this.restaurantReviews()) {
      ratingSum += rating.rating;
      count += 1;
    }
    const rating: RestaurantReviewAggregateDto = {
      restaurantId: this.restaurantId,
      count: count,
      avg: ratingSum/count
    }
    return rating;
  }

  openCart() {
    this.cartShown.set(true)
  }

  closeCart() {
    this.cartShown.set(false)
  }

  openMap() {
    this.dialog.open(MapModal, {data: this.restaurant()?.address.coordinates});
  }

  openReviewModal() {
    this.dialog.open(ShowReviewsModal, {data: this.restaurantId});
  }

  openWriteReviewModal() {
    const dialogRef = this.dialog.open(WriteReviewModal, {disableClose: true});
    dialogRef.closed.subscribe((review) => {
      if (review) {
        const reviewObj = review as RestaurantReviewDtoToServer;
        const reviewDto: RestaurantReviewDtoToServer = {
          rating: reviewObj.rating,
          reviewText: reviewObj.reviewText,
        }
        this.restaurantService.submitReview(this.restaurantId, reviewDto).add(() => {
          this.refreshReviews();
        })
      }
    });
  }

  protected readonly faStar = faStar;
  protected readonly faCartShopping = faCartShopping;
  protected readonly faXmark = faXmark;
}
