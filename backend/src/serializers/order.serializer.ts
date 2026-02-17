import {Serializable} from './serializable.interface';
import {AddressDto, type OrderDto, OrderStatusEnum, OrderTypeEnum, PaymentMethodEnum} from '@shared/types';

export interface OrderRow {
  order_id: number;
  order_name: string;
  order_type: string;
  order_status: string;
  address_street: string | null;
  address_house_nr: string | null;
  address_postal_code: string | null;
  address_city: string | null;
  address_door: string | null;
  latitude: number | null;
  longitude: number | null;
  paid_amount: string;
  payment_method: string;
  coupon_id: number | null;
  user_id: number;
  created_at: Date;
}

export class OrderSerializer extends Serializable<OrderRow, OrderDto> {
  serialize(row: OrderRow): OrderDto {
    const dto: OrderDto = {
      id: row.order_id,
      name: row.order_name,
      type: row.order_type as OrderTypeEnum,
      status: row.order_status as OrderStatusEnum,
      paidAmount: parseFloat(row.paid_amount),
      paymentMethod: row.payment_method as PaymentMethodEnum,
      userId: row.user_id,
      createdAt: row.created_at
    };

    if (row.order_type === OrderTypeEnum.DELIVERY) { //address is only for deliveries (optional)
      dto.address = {
        street: row.address_street!,
        houseNr: row.address_house_nr!,
        postalCode: row.address_postal_code!,
        city: row.address_city!,
        door: row.address_door || undefined, //returns undefined if there is no address_door (since it's optional)
      } as AddressDto;

      if(row.latitude != null && row.longitude != null) {
        dto.address.coordinates = {
            latitude: row.latitude,
            longitude: row.longitude
        }
      }

    }

    if (row.coupon_id) { //coupon is optional
      dto.couponId = row.coupon_id;
    }

    return dto;
  }
}

export const orderSerializer = new OrderSerializer();
