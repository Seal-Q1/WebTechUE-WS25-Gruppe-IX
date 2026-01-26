import {Component, Input, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import {MenuItemDto} from '@shared/types';
import {GridList} from '../../../shared/grid-list/grid-list';
import {MenuItemGridListElement} from '../../../shared/grid-list/menu-item-grid-list-element/menu-item-grid-list-element';
import {MenuItemService} from '../../../services/menu-item-service';

@Component({
  selector: 'app-dish-list',
  imports: [GridList, MenuItemGridListElement],
  templateUrl: './dish-list.html',
  styleUrl: './dish-list.css',
})
export class DishList {
  @Input() dishes: MenuItemDto[] = [];
  @Input() restaurantId: number = 0;
  @Input() reorderEnabled: boolean = true;
  @Output() edit = new EventEmitter<MenuItemDto>();
  @Output() delete = new EventEmitter<number>();

  constructor(
    private menuItemService: MenuItemService,
    private cdr: ChangeDetectorRef
  ) {}


  onItemClick(dishId: number): void {
    const dish = this.dishes.find(d => d.id === dishId);
    if (dish) {
      this.edit.emit(dish);
      this.cdr.markForCheck();
    }
  }

  onOrderChanged(orderUpdates: { id: number; orderIndex: number }[]): void {
    if (this.restaurantId > 0) {
      this.menuItemService.updateMenuItemsOrder(this.restaurantId, orderUpdates).subscribe();
    }
  }

  onDelete(dishId: number): void {
    this.delete.emit(dishId);
    this.cdr.markForCheck();
  }
}
