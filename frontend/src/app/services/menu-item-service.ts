import {Injectable} from '@angular/core';
import {apiUrls} from '../config/api_urls';
import {HttpClient} from '@angular/common/http';
import {MenuItemDto} from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class MenuItemService {
  constructor(private http: HttpClient) {}

  getAllMenuItems(restaurantId: number) {
    return this.http.get<MenuItemDto[]>(apiUrls.allMenuItemsEndpoint(restaurantId));
  }

  getMenuItem(restaurantId: number, itemId: number) {
    return this.http.get<MenuItemDto>(apiUrls.menuItemEndpoint(restaurantId, itemId));
  }
}
