import {Component, Input, Output, EventEmitter} from '@angular/core';
import {CuisineDto} from '@shared/types';

@Component({
  selector: 'app-cuisine-list',
  imports: [],
  templateUrl: './cuisine-list.html',
  styleUrl: './cuisine-list.css',
})
export class CuisineList {
  @Input() cuisines: CuisineDto[] = [];
  @Output() edit = new EventEmitter<CuisineDto>();
  @Output() delete = new EventEmitter<number>();

  onEdit(cuisine: CuisineDto): void {
    this.edit.emit(cuisine);
  }

  onDelete(cuisineId: number): void {
    this.delete.emit(cuisineId);
  }
}
