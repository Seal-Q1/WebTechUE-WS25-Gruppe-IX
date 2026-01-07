import type { AddressDto } from './address.dto';
import { RestaurantStatusEnum } from './enums';

export interface RestaurantDto {
  id: number;
  name: string;
  ownerId?: number;
  phone: string;
  email: string;
  status: RestaurantStatusEnum;
  locationName: string;
  address: AddressDto;
}
