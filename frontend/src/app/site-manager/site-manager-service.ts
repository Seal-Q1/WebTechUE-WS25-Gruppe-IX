import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {apiUrls} from '../config/api_urls';
import {RestaurantDto, UserDto} from '@shared/types';

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalRestaurants: number;
  activeRestaurants: number;
  pendingRestaurants: number;
  ordersToday: number;
  revenueToday: number;
}

export interface UserWithStatus extends UserDto {
  status: 'active' | 'suspended' | 'warned';
  warningCount: number;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SiteManagerService {
  constructor(private http: HttpClient) {
  }

  // Dashboard Statistics
  getDashboardStats() {
    return this.http.get<DashboardStats>(apiUrls.adminStatsEndpoint());
  }

  // Restaurant Management
  getAllRestaurants() {
    return this.http.get<RestaurantDto[]>(apiUrls.allRestaurantsEndpoint());
  }

  getPendingRestaurants() {
    return this.http.get<RestaurantDto[]>(apiUrls.adminPendingRestaurantsEndpoint());
  }

  getActiveRestaurants() {
    return this.http.get<RestaurantDto[]>(apiUrls.adminActiveRestaurantsEndpoint());
  }

  approveRestaurant(restaurantId: number) {
    return this.http.post<RestaurantDto>(apiUrls.adminApproveRestaurantEndpoint(restaurantId), {});
  }

  rejectRestaurant(restaurantId: number, reason?: string) {
    return this.http.post<RestaurantDto>(apiUrls.adminRejectRestaurantEndpoint(restaurantId), {reason});
  }

  // User Management
  getAllUsers() {
    return this.http.get<UserWithStatus[]>(apiUrls.adminUsersEndpoint());
  }

  suspendUser(userId: number, reason: string) {
    return this.http.post<UserWithStatus>(apiUrls.adminSuspendUserEndpoint(userId), {reason});
  }

  warnUser(userId: number, reason: string) {
    return this.http.post<UserWithStatus>(apiUrls.adminWarnUserEndpoint(userId), {reason});
  }

  activateUser(userId: number) {
    return this.http.post<UserWithStatus>(apiUrls.adminActivateUserEndpoint(userId), {});
  }
}
