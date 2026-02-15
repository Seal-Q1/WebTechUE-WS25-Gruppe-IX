import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoyaltyService } from '../../services/loyalty.service';
import type { UserPointsDto, PromotionDto } from '@shared/types';

@Component({
  selector: 'app-points-badge',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (isLoggedIn) {
      <a routerLink="/loyalty" class="points-badge" [class.has-promotion]="hasActivePromotion">
        @if (hasActivePromotion) {
          <span class="promo-indicator" [title]="promotionText">★</span>
        }
        <span class="points-value">{{ points?.currentBalance ?? 0 }} pts</span>
      </a>
    }
  `,
  styles: [`
    .points-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #f59e0b;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      transition: background 0.2s;
    }
    
    .points-badge:hover {
      background: #d97706;
    }
    
    .points-badge.has-promotion {
      background: #ea580c;
    }
    
    .promo-indicator {
      margin-right: 2px;
    }
    
    .points-value {
      font-size: 13px;
    }
  `]
})
export class PointsBadgeComponent implements OnInit, OnDestroy {
  private loyaltyService = inject(LoyaltyService);
  private cdr = inject(ChangeDetectorRef);
  private subscriptions: Subscription[] = [];
  
  points: UserPointsDto | null = null;
  promotions: PromotionDto[] = [];
  
  get isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }
  
  get hasActivePromotion(): boolean {
    return this.promotions.length > 0;
  }
  
  get promotionText(): string {
    if (this.promotions.length === 0) return '';
    const best = this.promotions.reduce((a, b) => a.multiplier > b.multiplier ? a : b);
    return `${best.name}: ${best.multiplier}x points!`;
  }

  ngOnInit(): void {
    if (this.isLoggedIn) {
      // Subscribe to points updates
      this.subscriptions.push(
        this.loyaltyService.points$.subscribe(points => {
          this.points = points;
          this.cdr.detectChanges();
        })
      );
      
      // Subscribe to promotion updates
      this.subscriptions.push(
        this.loyaltyService.promotions$.subscribe(promotions => {
          this.promotions = promotions;
          this.cdr.detectChanges();
        })
      );
      
      // Initial load
      this.loyaltyService.refreshPoints();
      this.loyaltyService.getPromotions().subscribe();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
