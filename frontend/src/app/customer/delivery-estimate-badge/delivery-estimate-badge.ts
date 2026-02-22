import {Component, input} from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faTruckFast} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-delivery-estimate-badge',
    imports: [
        FaIconComponent
    ],
  templateUrl: './delivery-estimate-badge.html',
  styleUrl: './delivery-estimate-badge.css',
})
export class DeliveryEstimateBadge {
  deliveryTime = input.required<number | undefined>();

  protected readonly faTruckFast = faTruckFast;
}
