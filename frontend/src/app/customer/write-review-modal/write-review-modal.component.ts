import {Component, inject} from '@angular/core';
import {DialogRef} from '@angular/cdk/dialog';
import {RestaurantReviewDtoToServer} from '@shared/types';

@Component({
  selector: 'app-review-modal',
  imports: [],
  templateUrl: './write-review-modal.component.html',
  styleUrl: './write-review-modal.component.css',
})
export class WriteReviewModal {
  private dialogRef = inject(DialogRef)

  rating: number = 1;
  reviewText: string = '';

  onRatingChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.rating = parseInt(target.value);
  }

  onTextChange(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.reviewText = target.value;
  }

  onCancel() {
    this.dialogRef.close()
  }

  onSubmit() {
    const review: RestaurantReviewDtoToServer = {
      rating: this.rating,
      reviewText: this.reviewText,
    }

    this.dialogRef.close(review);
  }
}
