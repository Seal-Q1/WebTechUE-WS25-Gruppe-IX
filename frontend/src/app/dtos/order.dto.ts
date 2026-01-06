import {AddressDto} from './address.dto';
import {PaymentMethodEnum} from './paymentMethod.enum';
import {OrderTypeEnum} from './orderType.enum';
import {OrderStatusEnum} from './orderStatus.enum';

export interface OrderDto {
  id: number,
  name: string,
  type: OrderTypeEnum,
  status: OrderStatusEnum,
  address?: AddressDto, //optional
  paidAmount: number,
  paymentMethod: PaymentMethodEnum,
  couponId?: number,
  userId: number,
  createdAt: Date
}
