import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoyaltyService } from '../../services/loyalty.service';
import type {
  LoyaltyDashboardDto,
  RewardDto,
  PromotionDto,
  PointTransactionDto,
  RewardRedemptionDto
} from '@shared/types';

@Component({
  selector: 'app-loyalty-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './loyalty-dashboard.html',
  styleUrl: './loyalty-dashboard.css'
})
export class LoyaltyDashboardComponent implements OnInit {
  private loyaltyService = inject(LoyaltyService);
  private cdr = inject(ChangeDetectorRef);
  
  dashboard: LoyaltyDashboardDto | null = null;
  loading = true;
  error = '';
  
  // Modal state
  showRedeemModal = false;
  selectedReward: RewardDto | null = null;
  redeeming = false;
  redeemSuccess = false;
  redeemError = '';

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = '';
    
    this.loyaltyService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to load loyalty dashboard';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Reward type helpers
  getRewardTypeLabel(type: string): string {
    switch (type) {
      case 'fixed_discount': return 'Fixed Discount';
      case 'percentage_discount': return 'Percentage Off';
      case 'free_product': return 'Free Item';
      default: return type;
    }
  }

  getRewardIcon(type: string): string {
    switch (type) {
      case 'fixed_discount': return '€';
      case 'percentage_discount': return '%';
      case 'free_product': return '★';
      default: return '•';
    }
  }

  getRewardValue(reward: RewardDto): string {
    switch (reward.rewardType) {
      case 'fixed_discount': return `€${reward.discountValue} off`;
      case 'percentage_discount': return `${reward.discountValue}% off`;
      case 'free_product': return `Free ${reward.menuItemName || 'item'}`;
      default: return '';
    }
  }

  // Transaction type helpers
  getTransactionIcon(type: string): string {
    switch (type) {
      case 'earned': return '+';
      case 'redeemed': return '-';
      case 'bonus': return '★';
      case 'expired': return '○';
      case 'adjustment': return '~';
      default: return '•';
    }
  }

  getTransactionClass(type: string): string {
    switch (type) {
      case 'earned':
      case 'bonus':
        return 'positive';
      case 'redeemed':
      case 'expired':
        return 'negative';
      default:
        return 'neutral';
    }
  }

  // Redemption modal
  openRedeemModal(reward: RewardDto): void {
    if (!reward.canAfford) return;
    
    this.selectedReward = reward;
    this.showRedeemModal = true;
    this.redeemSuccess = false;
    this.redeemError = '';
  }

  closeRedeemModal(): void {
    this.showRedeemModal = false;
    this.selectedReward = null;
    this.redeemError = '';
    
    if (this.redeemSuccess) {
      this.loadDashboard();
    }
  }

  confirmRedeem(): void {
    if (!this.selectedReward || this.redeeming) return;
    
    this.redeeming = true;
    this.redeemError = '';
    
    this.loyaltyService.redeemReward(this.selectedReward.id).subscribe({
      next: () => {
        this.redeemSuccess = true;
        this.redeeming = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.redeemError = err.error?.error || 'Failed to redeem reward';
        this.redeeming = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Format date
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Promotion helpers
  getPromotionDays(promotion: PromotionDto): string {
    if (!promotion.applicableDays || promotion.applicableDays.length === 0) {
      return 'Every day';
    }
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return promotion.applicableDays.map(d => dayNames[d]).join(', ');
  }

  isPromotionActiveToday(promotion: PromotionDto): boolean {
    if (!promotion.applicableDays || promotion.applicableDays.length === 0) {
      return true;
    }
    const today = new Date().getDay();
    return promotion.applicableDays.includes(today);
  }
}
