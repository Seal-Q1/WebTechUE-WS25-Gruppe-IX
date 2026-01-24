import {Component, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GridListElementBase} from '../grid-list-element';
import {CuisineDto} from '@shared/types';

@Component({
  selector: 'app-cuisine-grid-list-element',
  imports: [CommonModule],
  templateUrl: './cuisine-grid-list-element.html',
  styleUrl: './cuisine-grid-list-element.css',
})
export class CuisineGridListElement extends GridListElementBase {
  @Input() cuisine!: CuisineDto;

  @Output() itemClick = new EventEmitter<number>();

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
}
