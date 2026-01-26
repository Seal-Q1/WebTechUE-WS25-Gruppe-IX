import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoyaltyService } from '../../services/loyalty.service';
import type { PointTransactionDto, RewardRedemptionDto } from '@shared/types';

@Component({
  selector: 'app-loyalty-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './loyalty-history.html',
  styleUrl: './loyalty-history.css'
})
export class LoyaltyHistoryComponent implements OnInit {
  private loyaltyService = inject(LoyaltyService);
  private cdr = inject(ChangeDetectorRef);
  
  activeTab: 'transactions' | 'redemptions' = 'transactions';
  
  transactions: PointTransactionDto[] = [];
  redemptions: RewardRedemptionDto[] = [];
  
  loadingTransactions = true;
  loadingRedemptions = true;
  error = '';

  ngOnInit(): void {
    this.loadTransactions();
    this.loadRedemptions();
  }

  loadTransactions(): void {
    this.loadingTransactions = true;
    this.loyaltyService.getTransactions(100).subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.loadingTransactions = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to load transactions';
        this.loadingTransactions = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadRedemptions(): void {
    this.loadingRedemptions = true;
    this.loyaltyService.getRedemptions().subscribe({
      next: (redemptions) => {
        this.redemptions = redemptions;
        this.loadingRedemptions = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to load redemptions';
        this.loadingRedemptions = false;
        this.cdr.detectChanges();
      }
    });
  }

  setTab(tab: 'transactions' | 'redemptions'): void {
    this.activeTab = tab;
  }

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

  getTransactionLabel(type: string): string {
    switch (type) {
      case 'earned': return 'Points Earned';
      case 'redeemed': return 'Points Redeemed';
      case 'bonus': return 'Bonus Points';
      case 'expired': return 'Points Expired';
      case 'adjustment': return 'Adjustment';
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

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRedemptionStatus(redemption: RewardRedemptionDto): string {
    return redemption.usedAt ? 'Used' : 'Available';
  }

  getRedemptionStatusClass(redemption: RewardRedemptionDto): string {
    return redemption.usedAt ? 'status-used' : 'status-available';
  }
}
