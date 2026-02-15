import {inject, Injectable} from '@angular/core';
import {apiUrls} from '../config/api_urls';
import {HttpClient} from '@angular/common/http';
import {
  ImageDto,
  OpeningHoursDto,
  RestaurantDto, RestaurantReviewAggregateDto,
  RestaurantReviewDto,
  RestaurantReviewDtoToServer
} from '@shared/types';
import {of, tap} from 'rxjs';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  images: Map<number, ImageDto> = new Map();
  private authService = inject(AuthService);

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
    if(this.images.has(restaurantId)) {
      return of(this.images.get(restaurantId)!);
    }
    return this.http.get<ImageDto>(apiUrls.restaurantImageEndpoint(restaurantId)).pipe(
      tap(res => this.images.set(restaurantId, res)),
    );
  }

  updateRestaurantImage(restaurantId: number, image: string | null) {
    return this.http.put<ImageDto>(apiUrls.restaurantImageEndpoint(restaurantId), { image });
  }

  updateRestaurantsOrder(items: { id: number; orderIndex: number }[]) {
    return this.http.patch<void>(apiUrls.restaurantsOrderEndpoint(), items);
  }

  deleteRestaurant(restaurantId: number) {
    return this.http.delete<void>(apiUrls.restaurantEndpoint(restaurantId));
  }

  getAggregatedReviews() {
    return this.http.get<RestaurantReviewAggregateDto[]>(apiUrls.restaurantAggregateReviewsEndpoint());
  }

  getReviews(restaurantId: number) {
    return this.http.get<RestaurantReviewDto[]>(apiUrls.restaurantReviewEndpoint(restaurantId));
  }

  submitReview(restaurantId: number, review: RestaurantReviewDtoToServer) {
    console.log(restaurantId);
    return this.http.post<RestaurantReviewDto>(apiUrls.restaurantReviewEndpoint(restaurantId), review, this.authService.getAuthHeader()).subscribe((res) => console.log(res));
  }
}
