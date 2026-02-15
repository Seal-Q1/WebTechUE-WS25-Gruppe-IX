import {Component, Input} from '@angular/core';
import {OrderDto} from '@shared/types';

@Component({
  selector: 'app-order-element',
  imports: [],
  templateUrl: './order-element.html',
  styleUrl: './order-element.css',
})
export class OrderElement {
  @Input() order!: OrderDto;
}
