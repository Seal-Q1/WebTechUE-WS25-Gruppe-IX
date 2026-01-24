import {Component, Input, Output, EventEmitter} from '@angular/core';
import {CuisineDto} from '@shared/types';
import {GridList} from '../../../shared/grid-list/grid-list';
import {CuisineGridListElement} from '../../../shared/grid-list/cuisine-grid-list-element/cuisine-grid-list-element';
import {CuisineService} from '../../../services/cuisine-service';

@Component({
  selector: 'app-cuisine-list',
  imports: [GridList, CuisineGridListElement],
  templateUrl: './cuisine-list.html',
  styleUrl: './cuisine-list.css',
})
export class CuisineList {
  @Input() cuisines: CuisineDto[] = [];
  @Input() reorderEnabled: boolean = true;
  @Output() edit = new EventEmitter<CuisineDto>();
  @Output() delete = new EventEmitter<number>();

  constructor(private cuisineService: CuisineService) {}


  onItemClick(cuisineId: number): void {
    const cuisine = this.cuisines.find(c => c.id === cuisineId);
    if (cuisine) {
      this.edit.emit(cuisine);
    }
  }

  onOrderChanged(orderUpdates: { id: number; orderIndex: number }[]): void {
    this.cuisineService.updateCuisinesOrder(orderUpdates).subscribe();
  }

  onDelete(cuisineId: number): void {
    this.delete.emit(cuisineId);
  }
}
