import {Component, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GridListElementBase} from '../grid-list-element';
import {GridListElementAbstract} from '../grid-list-element-abstract';
import {CuisineDto} from '@shared/types';

@Component({
  selector: 'app-cuisine-grid-list-element',
  imports: [CommonModule, GridListElementAbstract],
  templateUrl: './cuisine-grid-list-element.html',
  styleUrl: './cuisine-grid-list-element.css',
})
export class CuisineGridListElement extends GridListElementBase {
  @Input() cuisine!: CuisineDto;
  @Input() active: boolean = false;

  @Output() itemClick = new EventEmitter<number>();
  @Output() checkBoxSelected = new EventEmitter<CuisineDto>();
  @Output() checkBoxUnselected = new EventEmitter<CuisineDto>();

  override get id(): number {
    return this.cuisine?.id ?? 0;
  }

  override get orderIndex(): number {
    return this.cuisine?.orderIndex ?? 0;
  }

  override get displayName(): string {
    return this.cuisine?.name ?? '';
  }

  getEmoji(): string {
    return this.cuisine?.emoji ?? '♨';
  }

  onItemClicked(): void {
    this.itemClick.emit(this.id);
  }

  onCheckboxClicked(e: Event): void {
    e.stopPropagation();
    const target = e.target as HTMLInputElement;
    if(target.checked) {
      this.checkBoxSelected.emit(this.cuisine);
    }
    else {
      this.checkBoxUnselected.emit(this.cuisine);
    }
  }
}
