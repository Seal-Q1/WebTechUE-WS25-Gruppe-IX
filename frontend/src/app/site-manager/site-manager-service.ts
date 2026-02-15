import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {apiUrls} from '../config/api_urls';
import {RestaurantDto, UserDto} from '@shared/types';
import {AuthService} from '../services/auth.service';

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

export interface DeliveryZone {
  id: number;
  name: string;
  postalCodes: string[];
  city: string;
  isActive: boolean;
  deliveryFee: number;
  createdAt?: string;
}

export interface Voucher {
  id: number;
  code: string;
  description?: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  minOrderValue?: number;
  maxUses?: number;
  currentUses: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  restaurantId?: number;
  restaurantName?: string;
  createdAt?: string;
}

export interface OrdersReport {
  period?: string;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  completedOrders: number;
  cancelledOrders: number;
}

export interface UsersReport {
  totalUsers: number;
  statusBreakdown: {status: string; count: number}[];
  loginActivity: {date: string; loginCount: number; uniqueUsers: number}[];
}

export interface RestaurantsReport {
  statusBreakdown: {status: string; count: number}[];
  topRestaurants: {id: number; name: string; orderCount: number; totalRevenue: number}[];
}

@Injectable({
  providedIn: 'root',
})
export class SiteManagerService {
  constructor(private http: HttpClient) {
  }

  authService = inject(AuthService)

  // Dashboard Statistics
  getDashboardStats() {
    return this.http.get<DashboardStats>(apiUrls.adminStatsEndpoint(), this.authService.getAuthHeader());
  }

  // Restaurant Management
  getAllRestaurants() {
    return this.http.get<RestaurantDto[]>(apiUrls.allRestaurantsEndpoint());
  }

  getPendingRestaurants() {
    return this.http.get<RestaurantDto[]>(apiUrls.adminPendingRestaurantsEndpoint(), this.authService.getAuthHeader());
  }

  getActiveRestaurants() {
    return this.http.get<RestaurantDto[]>(apiUrls.adminActiveRestaurantsEndpoint(), this.authService.getAuthHeader());
  }

  approveRestaurant(restaurantId: number) {
    return this.http.post<RestaurantDto>(apiUrls.adminApproveRestaurantEndpoint(restaurantId), {}, this.authService.getAuthHeader());
  }

  rejectRestaurant(restaurantId: number, reason?: string) {
    return this.http.post<RestaurantDto>(apiUrls.adminRejectRestaurantEndpoint(restaurantId), {reason}, this.authService.getAuthHeader());
  }

  // User Management
  getAllUsers() {
    return this.http.get<UserWithStatus[]>(apiUrls.adminUsersEndpoint(), this.authService.getAuthHeader());
  }

  suspendUser(userId: number, reason: string) {
    return this.http.post<UserWithStatus>(apiUrls.adminSuspendUserEndpoint(userId), {reason}, this.authService.getAuthHeader());
  }

  warnUser(userId: number, reason: string) {
    return this.http.post<UserWithStatus>(apiUrls.adminWarnUserEndpoint(userId), {reason}, this.authService.getAuthHeader());
  }

  activateUser(userId: number) {
    return this.http.post<UserWithStatus>(apiUrls.adminActivateUserEndpoint(userId), {}, this.authService.getAuthHeader());
  }

  // Platform Settings
  getSettings() {
    return this.http.get<Record<string, string>>(apiUrls.adminSettingsEndpoint(), this.authService.getAuthHeader());
  }

  updateSetting(key: string, value: string) {
    return this.http.put<{key: string; value: string}>(apiUrls.adminSettingEndpoint(key), {value}, this.authService.getAuthHeader());
  }

  // Delivery Zones
  getDeliveryZones() {
    return this.http.get<DeliveryZone[]>(apiUrls.adminDeliveryZonesEndpoint(), this.authService.getAuthHeader());
  }

  createDeliveryZone(zone: Partial<DeliveryZone>) {
    return this.http.post<DeliveryZone>(apiUrls.adminDeliveryZonesEndpoint(), zone, this.authService.getAuthHeader());
  }

  updateDeliveryZone(zoneId: number, zone: Partial<DeliveryZone>) {
    return this.http.put<DeliveryZone>(apiUrls.adminDeliveryZoneEndpoint(zoneId), zone, this.authService.getAuthHeader());
  }

  deleteDeliveryZone(zoneId: number) {
    return this.http.delete<{message: string}>(apiUrls.adminDeliveryZoneEndpoint(zoneId), this.authService.getAuthHeader());
  }

  // Vouchers
  getVouchers() {
    return this.http.get<Voucher[]>(apiUrls.adminVouchersEndpoint(), this.authService.getAuthHeader());
  }

  createVoucher(voucher: Partial<Voucher>) {
    return this.http.post<Voucher>(apiUrls.adminVouchersEndpoint(), voucher, this.authService.getAuthHeader());
  }

  updateVoucher(voucherId: number, voucher: Partial<Voucher>) {
    return this.http.put<Voucher>(apiUrls.adminVoucherEndpoint(voucherId), voucher, this.authService.getAuthHeader());
  }

  deleteVoucher(voucherId: number) {
    return this.http.delete<{message: string}>(apiUrls.adminVoucherEndpoint(voucherId), this.authService.getAuthHeader());
  }

  // Reporting
  getOrdersReport(startDate?: string, endDate?: string, groupBy?: 'day' | 'week' | 'month') {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (groupBy) params = params.set('groupBy', groupBy);
    return this.http.get<OrdersReport[]>(apiUrls.adminOrdersReportEndpoint(), {params, ...this.authService.getAuthHeader()});
  }

  getUsersReport(startDate?: string, endDate?: string) {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<UsersReport>(apiUrls.adminUsersReportEndpoint(), {params, ...this.authService.getAuthHeader()});
  }

  getRestaurantsReport() {
    return this.http.get<RestaurantsReport>(apiUrls.adminRestaurantsReportEndpoint(), this.authService.getAuthHeader());
  }
}
