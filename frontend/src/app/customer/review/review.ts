import {Component, Input} from '@angular/core';
import {StarRating} from '../star-rating/star-rating';

@Component({
  selector: 'app-review',
  imports: [
    StarRating
  ],
  templateUrl: './review.html',
  styleUrl: './review.css',
})
export class Review {
  @Input() rating!: number;
  @Input() reviewText: string = "";
  @Input() timestamp!: Date;
}
