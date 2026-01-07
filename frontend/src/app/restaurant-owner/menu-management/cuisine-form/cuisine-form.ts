import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CuisineDto } from '@shared/types';

@Component({
  selector: 'app-cuisine-form',
  imports: [FormsModule],
  templateUrl: './cuisine-form.html',
  styleUrl: './cuisine-form.css',
})
export class CuisineForm {
  @Input() cuisine: CuisineDto | null = null;
  @Output() save = new EventEmitter<{ name: string; description?: string }>();
  @Output() cancel = new EventEmitter<void>();

  name = '';
  description = '';

  ngOnChanges(): void {
    if (this.cuisine) {
      this.name = this.cuisine.name;
      this.description = this.cuisine.description ?? '';
    } else {
      this.resetForm();
    }
  }

  onSubmit(): void {
    const data: { name: string; description?: string } = {
      name: this.name
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
    this.description = '';
  }
}
