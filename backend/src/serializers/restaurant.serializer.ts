import { Serializable } from './serializable.interface';
import type { RestaurantDto } from '@shared/types';
import { RestaurantStatusEnum } from '@shared/types';

export interface RestaurantRow {
  restaurant_id: number;
  restaurant_name: string;
  owner_id: number | null;
  phone: string;
  email: string;
  restaurant_status_id: string;
  location_name: string;
  address_street: string;
  address_house_nr: string;
  address_postal_code: string;
  address_city: string;
  address_door: string | null;
}

export class RestaurantSerializer extends Serializable<RestaurantRow, RestaurantDto> {
  serialize(row: RestaurantRow): RestaurantDto {
    const dto: RestaurantDto = {
      id: row.restaurant_id,
      name: row.restaurant_name,
      phone: row.phone,
      email: row.email,
      status: row.restaurant_status_id as RestaurantStatusEnum,
      locationName: row.location_name,
      address: {
        street: row.address_street,
        houseNr: row.address_house_nr,
        postalCode: row.address_postal_code,
        city: row.address_city,
        door: row.address_door ?? undefined
      }
    };

    if (row.owner_id) {
      dto.ownerId = row.owner_id;
    }

    return dto;
  }
}

export const restaurantSerializer = new RestaurantSerializer();
