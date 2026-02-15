import {Component, inject, Inject, Signal} from '@angular/core';
import {DIALOG_DATA} from '@angular/cdk/dialog';
import {RestaurantService} from '../../../services/restaurant-service';
import {toSignal} from '@angular/core/rxjs-interop';
import {Review} from '../../review/review';
import {RestaurantReviewDto} from '@shared/types';

@Component({
  selector: 'app-show-reviews-modal',
  imports: [
    Review
  ],
  templateUrl: './show-reviews-modal.html',
  styleUrl: './show-reviews-modal.css',
})
export class ShowReviewsModal {
  public restaurantId = inject<number>(DIALOG_DATA);

  private restaurantService = inject(RestaurantService);
  reviews: Signal<RestaurantReviewDto[]> = toSignal(this.restaurantService.getReviews(this.restaurantId), { initialValue: [] })
}
