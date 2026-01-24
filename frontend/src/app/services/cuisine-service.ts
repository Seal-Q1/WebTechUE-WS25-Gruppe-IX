import {Injectable} from '@angular/core';
import {apiUrls} from '../config/api_urls';
import {HttpClient} from '@angular/common/http';
import {CuisineDto} from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class CuisineService {
  constructor(private http: HttpClient) {}

  getAllCuisines() {
    return this.http.get<CuisineDto[]>(apiUrls.allCuisinesEndpoint());
  }

  getCuisine(cuisineId: number) {
    return this.http.get<CuisineDto>(apiUrls.cuisineEndpoint(cuisineId));
  }

  createCuisine(data: { name: string; description?: string; emoji?: string }) {
    return this.http.post<CuisineDto>(apiUrls.allCuisinesEndpoint(), data);
  }

  updateCuisine(cuisineId: number, data: { name: string; description?: string; emoji?: string }) {
    return this.http.put<CuisineDto>(apiUrls.cuisineEndpoint(cuisineId), data);
  }

  deleteCuisine(cuisineId: number) {
    return this.http.delete<void>(apiUrls.cuisineEndpoint(cuisineId));
  }

  updateCuisinesOrder(items: { id: number; orderIndex: number }[]) {
    return this.http.patch<void>(apiUrls.cuisinesOrderEndpoint(), items);
  }
}
