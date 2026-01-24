import {Serializable} from './serializable.interface';
import type {MenuItemDto} from '@shared/types';

export interface MenuItemRow {
  item_id: number;
  restaurant_id: number;
  item_name: string;
  item_price: string;
  item_description: string | null;
  is_deleted: boolean;
}

export class MenuItemSerializer extends Serializable<MenuItemRow, MenuItemDto> {
  serialize(row: MenuItemRow): MenuItemDto {
    const dto: MenuItemDto = {
      id: row.item_id,
      restaurantId: row.restaurant_id,
      name: row.item_name,
      price: parseFloat(row.item_price)
    };

    if (row.item_description) {
      dto.description = row.item_description;
    }

    return dto;
  }
}

export const menuItemSerializer = new MenuItemSerializer();
