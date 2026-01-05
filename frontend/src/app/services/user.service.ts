import { Injectable } from '@angular/core';
import {apiUrls} from '../config/api_urls';
import {UserDto} from '../dtos/user.dto';
import {HttpClient} from '@angular/common/http';

const API_URL: string = apiUrls.userEndpoint

@Injectable({
  providedIn: 'root',
})

export class UserService {
  constructor(private http: HttpClient) {}

  getUserDemo() {
    return this.http.get<any>(API_URL)
  }
}
