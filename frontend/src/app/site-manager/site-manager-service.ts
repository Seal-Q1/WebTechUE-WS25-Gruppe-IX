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
    return this.http.get<UserWithStatus[]>(apiUrls.adminUsersEndpoint(), this.authService.getAuthHeader());
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

  // Platform Settings
  getSettings() {
    return this.http.get<Record<string, string>>(apiUrls.adminSettingsEndpoint());
  }

  updateSetting(key: string, value: string) {
    return this.http.put<{key: string; value: string}>(apiUrls.adminSettingEndpoint(key), {value});
  }

  // Delivery Zones
  getDeliveryZones() {
    return this.http.get<DeliveryZone[]>(apiUrls.adminDeliveryZonesEndpoint());
  }

  createDeliveryZone(zone: Partial<DeliveryZone>) {
    return this.http.post<DeliveryZone>(apiUrls.adminDeliveryZonesEndpoint(), zone);
  }

  updateDeliveryZone(zoneId: number, zone: Partial<DeliveryZone>) {
    return this.http.put<DeliveryZone>(apiUrls.adminDeliveryZoneEndpoint(zoneId), zone);
  }

  deleteDeliveryZone(zoneId: number) {
    return this.http.delete<{message: string}>(apiUrls.adminDeliveryZoneEndpoint(zoneId));
  }

  // Vouchers
  getVouchers() {
    return this.http.get<Voucher[]>(apiUrls.adminVouchersEndpoint());
  }

  createVoucher(voucher: Partial<Voucher>) {
    return this.http.post<Voucher>(apiUrls.adminVouchersEndpoint(), voucher);
  }

  updateVoucher(voucherId: number, voucher: Partial<Voucher>) {
    return this.http.put<Voucher>(apiUrls.adminVoucherEndpoint(voucherId), voucher);
  }

  deleteVoucher(voucherId: number) {
    return this.http.delete<{message: string}>(apiUrls.adminVoucherEndpoint(voucherId));
  }

  // Reporting
  getOrdersReport(startDate?: string, endDate?: string, groupBy?: 'day' | 'week' | 'month') {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (groupBy) params = params.set('groupBy', groupBy);
    return this.http.get<OrdersReport[]>(apiUrls.adminOrdersReportEndpoint(), {params});
  }

  getUsersReport(startDate?: string, endDate?: string) {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<UsersReport>(apiUrls.adminUsersReportEndpoint(), {params});
  }

  getRestaurantsReport() {
    return this.http.get<RestaurantsReport>(apiUrls.adminRestaurantsReportEndpoint());
  }
}
