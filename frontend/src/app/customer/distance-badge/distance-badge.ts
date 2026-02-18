import {Component, input} from '@angular/core';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faLocationDot} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-distance-badge',
  imports: [
    FaIconComponent
  ],
  templateUrl: './distance-badge.html',
  styleUrl: './distance-badge.css',
})
export class DistanceBadge {
    distance = input.required<number | undefined>();

    protected readonly faLocationDot = faLocationDot;
}
