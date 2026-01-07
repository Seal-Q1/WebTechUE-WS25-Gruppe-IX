import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MenuItemDto } from '@shared/types';

@Component({
  selector: 'app-dish-list',
  imports: [DecimalPipe],
  templateUrl: './dish-list.html',
  styleUrl: './dish-list.css',
})
export class DishList {
  @Input() dishes: MenuItemDto[] = [];
  @Output() edit = new EventEmitter<MenuItemDto>();
  @Output() delete = new EventEmitter<number>();

  onEdit(dish: MenuItemDto): void {
    this.edit.emit(dish);
  }

  onDelete(dishId: number): void {
    this.delete.emit(dishId);
  }
}
