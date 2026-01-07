import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItemDto } from '@shared/types';

@Component({
  selector: 'app-dish-form',
  imports: [FormsModule],
  templateUrl: './dish-form.html',
  styleUrl: './dish-form.css',
})
export class DishForm {
  @Input() dish: MenuItemDto | null = null;
  @Output() save = new EventEmitter<{ name: string; price: number; description?: string }>();
  @Output() cancel = new EventEmitter<void>();

  name = '';
  price = 0;
  description = '';

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

  resetForm(): void {
    this.name = '';
    this.price = 0;
    this.description = '';
  }
}
