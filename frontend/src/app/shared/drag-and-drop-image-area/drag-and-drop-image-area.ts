// Heavily inspired by https://stackoverflow.com/questions/57480159/angular-drag-and-drop-to-upload-an-attachment

import { Component, Input, Output, EventEmitter, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ImageDto, serializeImageToBase64 } from '@shared/types';
import { ImageDisplay } from '../image-display/image-display';

@Component({
  selector: 'app-drag-and-drop-image-area',
  imports: [CommonModule, ImageDisplay],
  templateUrl: './drag-and-drop-image-area.html',
  styleUrl: './drag-and-drop-image-area.css',
})
export class DragAndDropImageArea implements AfterViewInit {
  @Input() fetchImage!: () => Observable<ImageDto>;
  @Input() saveImage!: (base64: string | null) => Observable<ImageDto>;
  @Output() imageSaved = new EventEmitter<ImageDto>();
  @Output() imageCleared = new EventEmitter<void>();

  savedImageDto: ImageDto | null = null;
  localImageDto: ImageDto | null = null;
  pendingBase64: string | null = null;
  isDragOver: boolean = false;
  isLoading: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.loadImage(); //image loading done only after component has finished initializing
  }

  loadImage(): void {
    if (this.fetchImage) {
      this.isLoading = true;
      this.cdr.detectChanges();
      this.fetchImage().subscribe({
        next: (dto) => {
          this.savedImageDto = dto;
          this.localImageDto = null;
          this.pendingBase64 = null;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.savedImageDto = null;
          this.localImageDto = null;
          this.pendingBase64 = null;
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  getDisplayDto(): ImageDto | null {
    return this.localImageDto ?? this.savedImageDto;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.isLoading) return;
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.isLoading) return;
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.isLoading) return;
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]!);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]!);
    }
  }

  private handleFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      return;
    }
    serializeImageToBase64(file).then((base64) => {
      this.pendingBase64 = base64;
      this.localImageDto = { id: this.savedImageDto?.id ?? 0, image: base64 };
    });
  }

  onSave(): void {
    if (this.pendingBase64 && this.saveImage) {
      this.saveImage(this.pendingBase64).subscribe((resultDto) => {
        this.savedImageDto = resultDto;
        this.localImageDto = null;
        this.pendingBase64 = null;
        this.imageSaved.emit(resultDto);
      });
    }
  }

  onReset(): void {
    this.localImageDto = null;
    this.pendingBase64 = null;
  }

  onClear(): void {
    if (this.saveImage) {
      this.saveImage(null).subscribe((resultDto) => {
        this.savedImageDto = resultDto;
        this.localImageDto = null;
        this.pendingBase64 = null;
        this.imageCleared.emit();
      });
    }
  }

  hasPendingChanges(): boolean {
    return this.pendingBase64 !== null;
  }
}
