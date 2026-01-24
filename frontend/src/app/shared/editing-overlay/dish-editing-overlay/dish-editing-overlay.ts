import {Component, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Observable} from 'rxjs';
import {ImageDto, MenuItemDto} from '@shared/types';
import {MenuItemService} from '../../../services/menu-item-service';
import {EditingOverlayBase} from '../editing-overlay-base';
import {EditingOverlayAbstract} from '../editing-overlay-abstract';

export interface DishFormData {
  name: string;
  price: number;
  description?: string;
}

@Component({
  selector: 'app-dish-editing-overlay',
  imports: [FormsModule, CommonModule, EditingOverlayAbstract],
  templateUrl: './dish-editing-overlay.html',
  styleUrl: './dish-editing-overlay.css',
})
export class DishEditingOverlay extends EditingOverlayBase<DishFormData> implements OnChanges {
  @Input() dish: MenuItemDto | null = null;
  @Input() restaurantId: number = 0;
  @Output() override save = new EventEmitter<DishFormData>();
  @Output() override cancel = new EventEmitter<void>();
  @Output() override delete = new EventEmitter<number>();

  name = '';
  price = 0;
  description = '';

  constructor(private menuItemService: MenuItemService) {
    super();
  }

  ngOnChanges(): void {
    if (this.dish) {
      this.name = this.dish.name;
      this.price = this.dish.price;
      this.description = this.dish.description ?? '';
    } else {
      this.resetForm();
    }
  }

  getTitle(): string {
    return this.dish ? 'Edit Dish' : 'New Dish';
  }

  isEditMode(): boolean {
    return !!this.dish;
  }

  onSave(): void {
    const data: DishFormData = {
      name: this.name,
      price: this.price
    };
    if (this.description) {
      data.description = this.description;
    }
    this.save.emit(data);
    this.resetForm();
  }

  override onDelete(id?: number): void {
    if (this.dish) {
      super.onDelete(this.dish.id);
    }
  }

  fetchImage = (): Observable<ImageDto> => {
    return this.menuItemService.getMenuItemImage(this.restaurantId, this.dish!.id);
  };

  saveImage = (base64: string | null): Observable<ImageDto> => {
    return this.menuItemService.updateMenuItemImage(this.restaurantId, this.dish!.id, base64);
  };

  private resetForm(): void {
    this.name = '';
    this.price = 0;
    this.description = '';
  }
}
