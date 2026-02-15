import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environment/environment';
import { AuthService } from './auth.service';
import type {
  UserPointsDto,
  PromotionDto,
  RewardDto,
  PointTransactionDto,
  RewardRedemptionDto,
  LoyaltyDashboardDto,
  PointsEarnedResponseDto,
  RedeemRewardRequestDto
} from '@shared/types';

@Injectable({
  providedIn: 'root'
})
export class LoyaltyService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = `${environment.apiUrl}/loyalty`;
  
  // Observable for points balance (can be used throughout the app)
  private pointsSubject = new BehaviorSubject<UserPointsDto | null>(null);
  public points$ = this.pointsSubject.asObservable();
  
  // Observable for active promotions
  private promotionsSubject = new BehaviorSubject<PromotionDto[]>([]);
  public promotions$ = this.promotionsSubject.asObservable();
  
  constructor() {
    // Register logout callback to clear cache
    this.authService.registerLogoutCallback(() => this.clearCache());
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Get full loyalty dashboard
  getDashboard(): Observable<LoyaltyDashboardDto> {
    return this.http.get<LoyaltyDashboardDto>(`${this.baseUrl}/dashboard`, {
      headers: this.getHeaders()
    }).pipe(
      tap(dashboard => {
        this.pointsSubject.next(dashboard.points);
        this.promotionsSubject.next(dashboard.activePromotions);
      })
    );
  }

  // Get current points balance
  getPoints(): Observable<UserPointsDto> {
    return this.http.get<UserPointsDto>(`${this.baseUrl}/points`, {
      headers: this.getHeaders()
    }).pipe(
      tap(points => this.pointsSubject.next(points))
    );
  }

  // Get active promotions (public endpoint)
  getPromotions(): Observable<PromotionDto[]> {
    return this.http.get<PromotionDto[]>(`${this.baseUrl}/promotions`).pipe(
      tap(promotions => this.promotionsSubject.next(promotions))
    );
  }

  // Get available rewards
  getRewards(): Observable<RewardDto[]> {
    return this.http.get<RewardDto[]>(`${this.baseUrl}/rewards`, {
      headers: this.getHeaders()
    });
  }

  // Redeem a reward
  redeemReward(rewardId: number): Observable<RewardRedemptionDto> {
    const body: RedeemRewardRequestDto = { rewardId };
    return this.http.post<RewardRedemptionDto>(`${this.baseUrl}/redeem`, body, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.refreshPoints())
    );
  }

  // Get redemption history
  getRedemptions(unusedOnly: boolean = false): Observable<RewardRedemptionDto[]> {
    const url = unusedOnly 
      ? `${this.baseUrl}/redemptions?unused=true`
      : `${this.baseUrl}/redemptions`;
    return this.http.get<RewardRedemptionDto[]>(url, {
      headers: this.getHeaders()
    });
  }

  // Get transaction history
  getTransactions(limit: number = 50): Observable<PointTransactionDto[]> {
    return this.http.get<PointTransactionDto[]>(`${this.baseUrl}/transactions?limit=${limit}`, {
      headers: this.getHeaders()
    });
  }

  // Award points for an order (called after order placement)
  earnPoints(orderId: number, orderTotal: number): Observable<PointsEarnedResponseDto> {
    return this.http.post<PointsEarnedResponseDto>(`${this.baseUrl}/earn`, {
      orderId,
      orderTotal
    }, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.refreshPoints())
    );
  }

  // Use a redemption on an order
  useRedemption(redemptionId: number, orderId: number): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.baseUrl}/use-redemption`, {
      redemptionId,
      orderId
    }, {
      headers: this.getHeaders()
    });
  }

  // Refresh points balance
  refreshPoints(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.getPoints().subscribe();
    }
  }

  // Clear cached data (on logout)
  clearCache(): void {
    this.pointsSubject.next(null);
    this.promotionsSubject.next([]);
  }

  // Get current cached points (synchronous)
  getCurrentPoints(): UserPointsDto | null {
    return this.pointsSubject.value;
  }

  // Get current cached promotions (synchronous)
  getCurrentPromotions(): PromotionDto[] {
    return this.promotionsSubject.value;
  }

  // Check if there's an active promotion today
  hasActivePromotion(): boolean {
    return this.promotionsSubject.value.length > 0;
  }

  // Get the best current multiplier
  getBestMultiplier(): number {
    const promotions = this.promotionsSubject.value;
    if (promotions.length === 0) return 1.0;
    return Math.max(...promotions.map(p => p.multiplier));
  }
}
