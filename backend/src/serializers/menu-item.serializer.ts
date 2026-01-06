import type {Serializable} from './serializable.interface';
import type {MenuItemDto} from '@shared/types';

export interface MenuItemRow {
  item_id: number;
  item_name: string;
  item_price: string; //[sic!] pg pool returns the NUMERIC(9,2) as string
  item_description: string | null;
}

export class MenuItemSerializer implements Serializable<MenuItemRow, MenuItemDto> {
  serialize(row: MenuItemRow): MenuItemDto {
    const dto: MenuItemDto = {
      id: row.item_id,
      name: row.item_name,
      price: parseFloat(row.item_price)
    };

    if (row.item_description) {
      dto.description = row.item_description;
    }

    return dto;
  }

  serialize_multiple(rows: MenuItemRow[]): MenuItemDto[] {
    return rows.map(row => this.serialize(row));
  }
}

export const menuItemSerializer = new MenuItemSerializer();
