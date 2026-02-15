import {Component, Input, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import {RestaurantDto} from '@shared/types';
import {GridList} from '../../../shared/grid-list/grid-list';
import {RestaurantGridListElement} from '../../../shared/grid-list/restaurant-grid-list-element/restaurant-grid-list-element';
import {RestaurantService} from '../../../services/restaurant-service';

@Component({
  selector: 'app-restaurant-grid-list',
  imports: [GridList, RestaurantGridListElement],
  templateUrl: './restaurant-grid-list.html',
  styleUrl: './restaurant-grid-list.css',
})
export class RestaurantGridList {
  @Input() restaurants: RestaurantDto[] = [];
  @Input() reorderEnabled: boolean = true;
  @Output() edit = new EventEmitter<RestaurantDto>();
  @Output() settings = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();

  constructor(private restaurantService: RestaurantService, private cdr: ChangeDetectorRef) {}

  onItemClick(restaurantId: number): void {
    const restaurant = this.restaurants.find(r => r.id === restaurantId);
    if (restaurant) {
      this.edit.emit(restaurant);
      this.cdr.markForCheck();
    }
  }

  onSettingsClick(restaurantId: number): void {
    this.settings.emit(restaurantId);
    this.cdr.markForCheck();
  }

  onOrderChanged(orderUpdates: { id: number; orderIndex: number }[]): void {
    this.restaurantService.updateRestaurantsOrder(orderUpdates).subscribe();
  }

  onDelete(restaurantId: number): void {
    this.delete.emit(restaurantId);
    this.cdr.markForCheck();
  }
}
