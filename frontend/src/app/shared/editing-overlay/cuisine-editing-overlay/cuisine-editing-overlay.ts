import {Component, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {CuisineDto} from '@shared/types';
import {EditingOverlayBase} from '../editing-overlay-base';
import {EditingOverlayAbstract} from '../editing-overlay-abstract';

export interface CuisineFormData {
  name: string;
  emoji?: string;
  description?: string;
}

@Component({
  selector: 'app-cuisine-editing-overlay',
  imports: [FormsModule, CommonModule, EditingOverlayAbstract],
  templateUrl: './cuisine-editing-overlay.html',
  styleUrl: './cuisine-editing-overlay.css',
})
export class CuisineEditingOverlay extends EditingOverlayBase<CuisineFormData> implements OnChanges {
  @Input() cuisine: CuisineDto | null = null;
  @Output() override save = new EventEmitter<CuisineFormData>();
  @Output() override cancel = new EventEmitter<void>();
  @Output() override delete = new EventEmitter<number>();

  name = '';
  emoji = '';
  description = '';

  ngOnChanges(): void {
    if (this.cuisine) {
      this.name = this.cuisine.name;
      this.emoji = this.cuisine.emoji ?? '';
      this.description = this.cuisine.description ?? '';
    } else {
      this.resetForm();
    }
  }

  getTitle(): string {
    return this.cuisine ? 'Edit Category' : 'New Category';
  }

  isEditMode(): boolean {
    return !!this.cuisine;
  }

  onSave(): void {
    const data: CuisineFormData = {
      name: this.name
    };
    if (this.emoji) {
      data.emoji = this.emoji;
    }
    if (this.description) {
      data.description = this.description;
    }
    this.save.emit(data);
    this.resetForm();
  }

  override onDelete(id?: number): void {
    if (this.cuisine) {
      super.onDelete(this.cuisine.id);
    }
  }

  private resetForm(): void {
    this.name = '';
    this.emoji = '';
    this.description = '';
  }
}
