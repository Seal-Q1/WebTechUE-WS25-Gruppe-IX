import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ImageDto, MenuItemDto } from '@shared/types';
import { MenuItemService } from '../../../services/menu-item-service';
import { DragAndDropImageArea } from '../../../shared/drag-and-drop-image-area/drag-and-drop-image-area';

@Component({
  selector: 'app-dish-form',
  imports: [FormsModule, CommonModule, DragAndDropImageArea],
  templateUrl: './dish-form.html',
  styleUrl: './dish-form.css',
})
export class DishForm {
  @Input() dish: MenuItemDto | null = null;
  @Input() restaurantId: number = 0;
  @Output() save = new EventEmitter<{ name: string; price: number; description?: string }>();
  @Output() cancel = new EventEmitter<void>();

  name = '';
  price = 0;
  description = '';

  constructor(private menuItemService: MenuItemService) {}

  ngOnChanges(): void {
    if (this.dish) {
      this.name = this.dish.name;
      this.price = this.dish.price;
      this.description = this.dish.description ?? '';
    } else {
      this.resetForm();
    }
  }

  onSubmit(): void {
    const data: { name: string; price: number; description?: string } = {
      name: this.name,
      price: this.price
    };
    if (this.description) {
      data.description = this.description;
    }
    this.save.emit(data);
    this.resetForm();
  }

  onCancel(): void {
    this.cancel.emit();
    this.resetForm();
  }

  fetchImage = (): Observable<ImageDto> => {
    return this.menuItemService.getMenuItemImage(this.restaurantId, this.dish!.id);
  };

  saveImage = (base64: string | null): Observable<ImageDto> => {
    return this.menuItemService.updateMenuItemImage(this.restaurantId, this.dish!.id, base64);
  };

  resetForm(): void {
    this.name = '';
    this.price = 0;
    this.description = '';
  }
}
