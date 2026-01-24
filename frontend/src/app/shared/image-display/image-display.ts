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
  @Input() isLoading: boolean = true;

  getImageUrl(): string | null {
    if (!this.imageDto || !this.imageDto.image) {
      return null;
    }
    return deserializeBase64ToDataUrl(this.imageDto.image);
  }

  hasImage(): boolean {
    return this.imageDto !== null && this.imageDto.image !== null;
  }
}
