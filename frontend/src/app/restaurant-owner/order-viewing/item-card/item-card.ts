import {Component, Input, Output, EventEmitter} from '@angular/core';
import {OrderItemDto, MenuItemDto} from '@shared/types';

@Component({
  selector: 'app-item-card',
  imports: [],
  templateUrl: './item-card.html',
  styleUrl: './item-card.css',
})
export class ItemCard {
  @Input() orderItem!: OrderItemDto;
  @Input() menuItem: MenuItemDto | undefined;

  @Output() loadMenuItem = new EventEmitter<number>();

  onLoadMenuItem(): void {
    this.loadMenuItem.emit(this.orderItem.itemId);
  }
}
