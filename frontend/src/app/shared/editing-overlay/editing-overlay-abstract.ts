import {Component, Input, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Observable} from 'rxjs';
import {ImageDto} from '@shared/types';
import {DragAndDropImageArea} from '../drag-and-drop-image-area/drag-and-drop-image-area';

@Component({
  selector: 'app-editing-overlay-abstract',
  imports: [CommonModule, FormsModule, DragAndDropImageArea],
  templateUrl: './editing-overlay-abstract.html',
  styleUrls: ['./editing-overlay-base.css', './editing-overlay-abstract.css'],
})
export class EditingOverlayAbstract {
  @Input() title: string = '';
  @Input() showImageUpload: boolean = false;
  @Input() canUploadImage: boolean = false;
  @Input() imageLabel: string = 'Image';
  @Input() canDelete: boolean = false;
  @Input() fetchImage: (() => Observable<ImageDto>) | null = null;
  @Input() saveImage: ((base64: string | null) => Observable<ImageDto>) | null = null;

  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  onSave(): void {
    this.save.emit();
    this.cdr.markForCheck();
  }

  onCancel(): void {
    this.cancel.emit();
    this.cdr.markForCheck();
  }

  onDelete(): void {
    this.delete.emit();
    this.cdr.markForCheck();
  }
}
