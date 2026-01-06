import {Component, Input, OnInit} from '@angular/core';
import {OrderDto} from '../../../dtos/order.dto';
import {DatePipe} from '@angular/common';
import {AddressCard} from '../address-card/address-card';

@Component({
  selector: 'app-order-card',
  imports: [
    DatePipe,
    AddressCard
  ],
  templateUrl: './order-card.html',
  styleUrl: './order-card.css',
})
export class OrderCardComponent implements OnInit {
  ngOnInit(): void {
      //console.log(this.order)
  }
  @Input() order!: OrderDto;
}
