import {Injectable} from '@angular/core';
import {apiUrls} from '../config/api_urls';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MenuItemService {
  constructor(private http: HttpClient) {}

  getMenuItem(itemId: number) {
    return this.http.get<any>(apiUrls.menuItemEndpoint(itemId));
  }
}
