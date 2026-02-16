import {Component, Input} from '@angular/core';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faStar, faStar as fasStar} from '@fortawesome/free-solid-svg-icons';
import {faStar as farStar} from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-star-rating',
  imports: [
    FaIconComponent
  ],
  templateUrl: './star-rating.html',
  styleUrl: './star-rating.css',
})
export class StarRating {
  @Input() rating = 0;
  readonly starArray = [1, 2, 3, 4, 5];

  protected readonly fasStar = fasStar;
  protected readonly farStar = farStar;
}
