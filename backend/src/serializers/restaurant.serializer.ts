import {Serializable} from './serializable.interface';
import type {AddressDto, RestaurantDto} from '@shared/types';
import {RestaurantStatusEnum} from '@shared/types';

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
  latitude: number | null;
  longitude: number | null;
  opening_hours_monday: string | null;
  opening_hours_tuesday: string | null;
  opening_hours_wednesday: string | null;
  opening_hours_thursday: string | null;
  opening_hours_friday: string | null;
  opening_hours_saturday: string | null;
  opening_hours_sunday: string | null;
  order_index?: number;
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
        door: row.address_door ?? undefined,
        latitude: row.latitude ?? undefined,
        longitude: row.longitude ?? undefined,
      } as AddressDto,
      orderIndex: row.order_index ?? 0
    };

    if (row.owner_id) {
      dto.ownerId = row.owner_id;
    }

      const openingHours: any = {};
      if (row.opening_hours_monday) openingHours.monday = row.opening_hours_monday;
      if (row.opening_hours_tuesday) openingHours.tuesday = row.opening_hours_tuesday;
      if (row.opening_hours_wednesday) openingHours.wednesday = row.opening_hours_wednesday;
      if (row.opening_hours_thursday) openingHours.thursday = row.opening_hours_thursday;
      if (row.opening_hours_friday) openingHours.friday = row.opening_hours_friday;
      if (row.opening_hours_saturday) openingHours.saturday = row.opening_hours_saturday;
      if (row.opening_hours_sunday) openingHours.sunday = row.opening_hours_sunday;

      if (Object.keys(openingHours).length > 0) {
          dto.openingHours = openingHours;
      }

      return dto;
  }
}

export const restaurantSerializer = new RestaurantSerializer();
