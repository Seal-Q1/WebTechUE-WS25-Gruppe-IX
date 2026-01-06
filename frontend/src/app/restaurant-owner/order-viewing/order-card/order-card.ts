import {Component, Input, OnInit} from '@angular/core';
import {OrderDto} from '../../../dtos/order.dto';
import {DatePipe} from '@angular/common';
import {AddressCard} from '../address-card/address-card';
import {OrderItemDto} from '../../../dtos/orderItem.dto';
import {OrderFetchService} from '../../../services/order-fetch-service';
import {ItemCard} from '../item-card/item-card';

@Component({
  selector: 'app-order-card',
  imports: [
    DatePipe,
    AddressCard,
    ItemCard
  ],
  templateUrl: './order-card.html',
  styleUrl: './order-card.css',
})
export class OrderCardComponent implements OnInit {
  ngOnInit(): void {
      //console.log(this.order)
  }
  @Input() order!: OrderDto;
  orderItems: OrderItemDto[] = [];

  constructor(private orderFetchService: OrderFetchService) {}

  loadOrderItems(): void {
    this.orderFetchService.getOrderItems(this.order.id).subscribe(items => {
        console.log('Order items:', items);
        this.orderItems = this.deserializeOrderItemData(items);
      }
    );
  }

  deserializeOrderItemData(data: Array<object>): OrderItemDto[] {
    return data.map((item: any): OrderItemDto => ({
      id: item.id,
      itemId: item.item_id,
      quantity: item.quantity,
      unitPrice: item.unit_price,
    }));
  }
}
