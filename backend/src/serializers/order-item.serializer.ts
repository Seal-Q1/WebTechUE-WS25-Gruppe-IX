import {Serializable} from './serializable.interface';
import type {OrderItemDto} from '@shared/types';
import {OrderItemWithMenuItemDto} from "@shared/types/order-item.dto";
import {MenuItemRow, menuItemSerializer} from "./menu-item.serializer";

export interface OrderItemRow {
  order_item_id: number;
  item_id: number;
  quantity: number;
  unit_price: string; //[sic!] pg pool returns the NUMERIC(9,2) as string
}

export interface OrderItemWithMenuItemRow extends OrderItemRow, MenuItemRow {}

export class OrderItemSerializer extends Serializable<OrderItemRow, OrderItemDto> {
  serialize(row: OrderItemRow): OrderItemDto {
    return {
      id: row.order_item_id,
      itemId: row.item_id,
      quantity: row.quantity,
      unitPrice: parseFloat(row.unit_price)
    };
  }
}

export class OrderItemWithMenuItemSerializer extends Serializable<OrderItemWithMenuItemRow, OrderItemWithMenuItemDto> {
    serialize(row: OrderItemWithMenuItemRow): OrderItemWithMenuItemDto {
        let dto = orderItemSerializer.serialize(row) as OrderItemWithMenuItemDto;
        dto.itemData = menuItemSerializer.serialize(row);
        return dto;
    }
}

export const orderItemSerializer = new OrderItemSerializer();
export const orderItemWithMenuItemSerializer = new OrderItemWithMenuItemSerializer()
