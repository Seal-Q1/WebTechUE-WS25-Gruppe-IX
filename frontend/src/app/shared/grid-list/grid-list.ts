import {Component, Input, Output, EventEmitter, ContentChildren, QueryList, TemplateRef, ContentChild} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-grid-list',
  imports: [CommonModule],
  templateUrl: './grid-list.html',
  styleUrl: './grid-list.css',
})
export class GridList<T extends {id: number; orderIndex: number}> {
  @Input() items: T[] = [];
  @Input() reorderEnabled: boolean = false;
  @ContentChild('itemTemplate') itemTemplate!: TemplateRef<{$implicit: T; index: number}>;
  @Output() orderChanged = new EventEmitter<{ id: number; orderIndex: number }[]>();

  private draggedItem: T | null = null;
  private draggedOverItem: T | null = null;

  onDragStart(event: DragEvent, item: T): void {
    if (!this.reorderEnabled) {
      event.preventDefault();
      return;
    }
    this.draggedItem = item;
    const target = event.target as HTMLElement;
    target.classList.add('dragging');
  }

  onDragEnd(event: DragEvent): void {
    const target = event.target as HTMLElement;
    target.classList.remove('dragging');
    this.draggedItem = null;
    this.draggedOverItem = null;
  }

  onDragOver(event: DragEvent, item: T): void {
    event.preventDefault();
    if (!this.reorderEnabled || !this.draggedItem || this.draggedItem === item) {
      return;
    }
    this.draggedOverItem = item;
  }

  onDragLeave(event: DragEvent): void {
    this.draggedOverItem = null;
  }

  onDrop(event: DragEvent, targetItem: T): void {
    event.preventDefault();
    if (!this.reorderEnabled || !this.draggedItem || this.draggedItem === targetItem) {
      return;
    }

    const draggedIndex = this.items.indexOf(this.draggedItem);
    const targetIndex = this.items.indexOf(targetItem);

    if (draggedIndex === -1 || targetIndex === -1) { //if it doesn't exist. (shouldn't ever happen?!)
      return;
    }

    const reorderedItems = [...this.items];
    reorderedItems.splice(draggedIndex, 1);
    reorderedItems.splice(targetIndex, 0, this.draggedItem);

    const orderUpdates: { id: number; orderIndex: number }[] = reorderedItems.map((item, index) => ({
      id: item.id,
      orderIndex: index
    }));

    reorderedItems.forEach((item, index) => {
      item.orderIndex = index;
    });

    this.items = reorderedItems;
    this.draggedOverItem = null;
    this.orderChanged.emit(orderUpdates);
  }

  isDraggedOver(item: T): boolean {
    return this.draggedOverItem === item && this.draggedItem !== item;
  }
}
