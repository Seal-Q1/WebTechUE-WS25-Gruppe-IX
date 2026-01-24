import {EventEmitter} from '@angular/core';

export abstract class EditingOverlayBase<T = unknown> {
  abstract save: EventEmitter<T>;
  abstract cancel: EventEmitter<void>;
  abstract delete: EventEmitter<number>;

  abstract getTitle(): string;
  abstract isEditMode(): boolean;
  abstract onSave(): void;

  onCancel(): void {
    this.cancel.emit();
  }

  onDelete(id: number): void {
    this.delete.emit(id);
  }
}
