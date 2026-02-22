import {inject, Injectable} from '@angular/core';
import {apiUrls} from '../config/api_urls';
import {HttpClient} from '@angular/common/http';
import {CuisineDto, CuisineRestaurantMapDto} from '@shared/types';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CuisineService {
  private authService = inject(AuthService);

  constructor(private http: HttpClient) {}

  getAllCuisines() {
    return this.http.get<CuisineDto[]>(apiUrls.allCuisinesEndpoint());
  }

  getCuisine(cuisineId: number) {
    return this.http.get<CuisineDto>(apiUrls.cuisineEndpoint(cuisineId));
  }

  getCuisineRestaurantMap() {
    return this.http.get<CuisineRestaurantMapDto[]>(apiUrls.cuisinesRestaurantMapEndpoint());
  }

  getCuisinesForRestaurant(restaurantId: number) {
    return this.http.get<CuisineDto[]>(apiUrls.cuisinesForRestaurantEndpoint(restaurantId));
  }

  createCuisine(data: { name: string; description?: string; emoji?: string }) {
    return this.http.post<CuisineDto>(apiUrls.allCuisinesEndpoint(), data, this.authService.getAuthHeader());
  }

  updateCuisine(cuisineId: number, data: { name: string; description?: string; emoji?: string }) {
    return this.http.put<CuisineDto>(apiUrls.cuisineEndpoint(cuisineId), data, this.authService.getAuthHeader());
  }

  deleteCuisine(cuisineId: number) {
    return this.http.delete<void>(apiUrls.cuisineEndpoint(cuisineId), this.authService.getAuthHeader());
  }

  updateCuisinesOrder(items: { id: number; orderIndex: number }[]) {
    return this.http.patch<void>(apiUrls.cuisinesOrderEndpoint(), items, this.authService.getAuthHeader());
  }
}
