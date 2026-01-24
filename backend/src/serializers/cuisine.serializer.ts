import { Serializable } from './serializable.interface';
import type { CuisineDto } from '@shared/types';

export interface CuisineRow {
  cuisine_id: number;
  cuisine_name: string;
  cuisine_description: string | null;
  cuisine_emoji: string | null;
  order_index: number;
}

export class CuisineSerializer extends Serializable<CuisineRow, CuisineDto> {
  serialize(row: CuisineRow): CuisineDto {
    const dto: CuisineDto = {
      id: row.cuisine_id,
      name: row.cuisine_name,
      orderIndex: row.order_index
    };

    if (row.cuisine_description) {
      dto.description = row.cuisine_description;
    }

    if (row.cuisine_emoji) {
      dto.emoji = row.cuisine_emoji;
    }

    return dto;
  }
}

export const cuisineSerializer = new CuisineSerializer();
