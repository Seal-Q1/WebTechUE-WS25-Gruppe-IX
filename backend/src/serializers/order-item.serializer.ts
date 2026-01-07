import {Serializable} from './serializable.interface';
import type {OrderItemDto} from '@shared/types';

export interface OrderItemRow {
  order_item_id: number;
  item_id: number;
  quantity: number;
  unit_price: string; //[sic!] pg pool returns the NUMERIC(9,2) as string
}

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

export const orderItemSerializer = new OrderItemSerializer();
