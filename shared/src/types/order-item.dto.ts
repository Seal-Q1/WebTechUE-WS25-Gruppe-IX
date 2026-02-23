import type {MenuItemDto} from "@shared/types/menu-item.dto";

export interface OrderItemDto {
  id: number;
  itemId: number;
  quantity: number;
  unitPrice: number;
}

export interface OrderItemWithMenuItemDto extends OrderItemDto {
    itemData: MenuItemDto;
}