import type {AddressDto} from './address.dto';
import { OrderStatusEnum, OrderTypeEnum, PaymentMethodEnum } from './enums';

export interface OrderDto {
  id: number;
  restaurantId: number;
  name: string;
  type: OrderTypeEnum;
  status: OrderStatusEnum;
  address?: AddressDto;
  paidAmount: number;
  paymentMethod: PaymentMethodEnum;
  couponId?: number;
  userId: number;
  createdAt: Date;
}
