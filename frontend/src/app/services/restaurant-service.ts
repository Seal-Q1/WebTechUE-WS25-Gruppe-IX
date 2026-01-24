import {Injectable} from '@angular/core';
import {apiUrls} from '../config/api_urls';
import {HttpClient} from '@angular/common/http';
import {ImageDto, OpeningHoursDto, RestaurantDto} from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  constructor(private http: HttpClient) {
  }

  getAllRestaurants() {
    return this.http.get<RestaurantDto[]>(apiUrls.allRestaurantsEndpoint());
  }

  getRestaurantProfile(restaurantId: number) {
    return this.http.get<RestaurantDto>(apiUrls.restaurantProfileEndpoint(restaurantId));
  }

  updateRestaurantProfile(restaurantId: number, data: {
    name: string;
    phone: string;
    email: string;
    openingHours?: OpeningHoursDto
  }) {
    return this.http.put<RestaurantDto>(apiUrls.restaurantProfileEndpoint(restaurantId), data);
  }

  createRestaurant(data: {
    name: string;
    phone: string;
    email: string;
    locationName: string;
    address: { street: string; houseNr: string; postalCode: string; city: string; door: string }
  }) {
    return this.http.post<RestaurantDto>(apiUrls.allRestaurantsEndpoint(), data);
  }

  getRestaurantImage(restaurantId: number) {
    return this.http.get<ImageDto>(apiUrls.restaurantImageEndpoint(restaurantId));
  }

  updateRestaurantImage(restaurantId: number, image: string | null) {
    return this.http.put<ImageDto>(apiUrls.restaurantImageEndpoint(restaurantId), { image });
  }
}
