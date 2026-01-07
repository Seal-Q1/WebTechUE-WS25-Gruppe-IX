import type {AddressDto} from './address.dto';
import {RestaurantStatusEnum} from './enums';

export interface OpeningHoursDto {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
}

export interface RestaurantDto {
  id: number;
  name: string;
  ownerId?: number;
  phone: string;
  email: string;
  status: RestaurantStatusEnum;
  locationName: string;
  address: AddressDto;
    openingHours?: OpeningHoursDto;
}

//TODO user-facing DTOs should not expose all/sensitive data
//TODO or permit DTO to have null values for (problematic?)