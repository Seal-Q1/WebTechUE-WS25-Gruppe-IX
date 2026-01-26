import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageDto, deserializeBase64ToDataUrl } from '@shared/types';

@Component({
  selector: 'app-image-display',
  imports: [CommonModule],
  templateUrl: './image-display.html',
  styleUrl: './image-display.css',
})
export class ImageDisplay {
  @Input() imageDto: ImageDto | null = null;

  getImageUrl(): string | null {
    if (!this.imageDto || !this.imageDto.image) {
      return null;
    }
    return deserializeBase64ToDataUrl(this.imageDto.image);
  }

  isLoading(): boolean {
    return this.imageDto == null;
  }

  hasImage(): boolean {
    return this.imageDto !== null && this.imageDto.image !== null;
  }
}
