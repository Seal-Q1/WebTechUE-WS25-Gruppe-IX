import {Serializable} from './serializable.interface';
import type {ImageDto} from '@shared/types';

export interface ImageRow {
  id: number;
  image: string | null;
}

export class ImageSerializer extends Serializable<ImageRow, ImageDto> {
  serialize(row: ImageRow): ImageDto {
    return {
      id: row.id,
      image: row.image
    };
  }
}

export const imageSerializer = new ImageSerializer();
