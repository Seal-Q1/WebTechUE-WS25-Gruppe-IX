import {Component, Input, Output, EventEmitter} from '@angular/core';
import {OrderDto, OrderItemDto, MenuItemDto, OrderStatusEnum} from '@shared/types';
import {DatePipe} from '@angular/common';
import {AddressCard} from '../address-card/address-card';
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
export class OrderCardComponent {
  @Input() order!: OrderDto;
  @Input() orderItems: OrderItemDto[] = [];
  @Input() menuItemsMap: Map<number, MenuItemDto> = new Map();

  @Output() loadItems = new EventEmitter<number>();
  @Output() loadMenuItem = new EventEmitter<number>();
  @Output() statusChange = new EventEmitter<{orderId: number, status: OrderStatusEnum}>();
  @Output() deleteOrder = new EventEmitter<number>();

  onLoadItems(): void {
    this.loadItems.emit(this.order.id);
  }

  onLoadMenuItem(itemId: number): void {
    this.loadMenuItem.emit(itemId);
  }

  onStatusChange(status: OrderStatusEnum): void {
    this.statusChange.emit({orderId: this.order.id, status});
  }

  onDelete(): void {
    this.deleteOrder.emit(this.order.id);
  }

  getMenuItem(itemId: number): MenuItemDto | undefined {
    return this.menuItemsMap.get(itemId);
  }
}
