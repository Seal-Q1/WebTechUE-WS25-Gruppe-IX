import {inject, Injectable} from '@angular/core';
import {apiUrls} from '../config/api_urls';
import {HttpClient} from '@angular/common/http';
import {
  DishReviewDto,
  DishReviewDtoToServer,
  ImageDto,
  MenuItemDto,
  RestaurantReviewDto,
  RestaurantReviewDtoToServer
} from '@shared/types';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class MenuItemService {
  private authService = inject(AuthService);

  constructor(private http: HttpClient) {}

  getAllMenuItems(restaurantId: number) {
    return this.http.get<MenuItemDto[]>(apiUrls.allMenuItemsEndpoint(restaurantId));
  }

  getMenuItem(restaurantId: number, itemId: number) {
    return this.http.get<MenuItemDto>(apiUrls.menuItemEndpoint(restaurantId, itemId));
  }

  createMenuItem(restaurantId: number, data: { name: string; price: number; description?: string }) {
    return this.http.post<MenuItemDto>(apiUrls.allMenuItemsEndpoint(restaurantId), data);
  }

  updateMenuItem(restaurantId: number, itemId: number, data: { name: string; price: number; description?: string }) {
    return this.http.put<MenuItemDto>(apiUrls.menuItemEndpoint(restaurantId, itemId), data);
  }

  deleteMenuItem(restaurantId: number, itemId: number) {
    return this.http.delete<void>(apiUrls.menuItemEndpoint(restaurantId, itemId));
  }

  getMenuItemImage(restaurantId: number, itemId: number) {
    return this.http.get<ImageDto>(apiUrls.menuItemImageEndpoint(restaurantId, itemId));
  }

  updateMenuItemImage(restaurantId: number, itemId: number, image: string | null) {
    return this.http.put<ImageDto>(apiUrls.menuItemImageEndpoint(restaurantId, itemId), { image });
  }

  updateMenuItemsOrder(restaurantId: number, items: { id: number; orderIndex: number }[]) {
    return this.http.patch<void>(apiUrls.menuItemsOrderEndpoint(restaurantId), items);
  }

  getReviews(restaurantId: number, itemId: number) {
    return this.http.get<DishReviewDto[]>(apiUrls.menuItemReviewEndpoint(restaurantId, itemId));
  }

  submitReview(restaurantId: number, itemId: number, review: DishReviewDtoToServer) {
    return this.http.post<DishReviewDto>(apiUrls.menuItemReviewEndpoint(restaurantId, itemId), review, this.authService.getAuthHeader()).subscribe((res) => console.log(res));
  }
}
