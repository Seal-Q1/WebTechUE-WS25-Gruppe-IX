import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {OrdersReport, RestaurantsReport, SiteManagerService, UsersReport} from '../site-manager-service';
import {AdminLayout} from '../admin-layout/admin-layout';

@Component({
  selector: 'app-reporting',
  imports: [CommonModule, FormsModule, AdminLayout],
  templateUrl: './reporting.html',
  styleUrl: './reporting.css',
})
export class Reporting implements OnInit {
  activeTab: 'orders' | 'users' | 'restaurants' = 'orders';

  // Orders Report
  ordersReport: OrdersReport[] = [];
  ordersGroupBy: 'day' | 'week' | 'month' | '' = 'day';
  ordersStartDate = '';
  ordersEndDate = '';

  // Users Report
  usersReport: UsersReport | null = null;
  usersStartDate = '';
  usersEndDate = '';

  // Restaurants Report
  restaurantsReport: RestaurantsReport | null = null;

  isLoading = false;
  error: string | null = null;

  constructor(
    private siteManagerService: SiteManagerService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Set default date range to last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    this.ordersEndDate = today.toISOString().split('T')[0];
    this.ordersStartDate = thirtyDaysAgo.toISOString().split('T')[0];
    this.usersEndDate = this.ordersEndDate;
    this.usersStartDate = this.ordersStartDate;

    this.loadOrdersReport();
    this.loadUsersReport();
    this.loadRestaurantsReport();
  }

  // Orders Report
  loadOrdersReport(): void {
    this.isLoading = true;
    this.siteManagerService.getOrdersReport(
      this.ordersStartDate || undefined,
      this.ordersEndDate || undefined,
      this.ordersGroupBy || undefined
    ).subscribe({
      next: (data) => {
        this.ordersReport = data;
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load orders report:', err);
        this.error = 'Failed to load orders report';
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  get ordersSummary(): OrdersReport {
    if (this.ordersReport.length === 0) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        completedOrders: 0,
        cancelledOrders: 0
      };
    }
    return {
      totalOrders: this.ordersReport.reduce((sum, r) => sum + r.totalOrders, 0),
      totalRevenue: this.ordersReport.reduce((sum, r) => sum + r.totalRevenue, 0),
      avgOrderValue: this.ordersReport.reduce((sum, r) => sum + r.avgOrderValue, 0) / this.ordersReport.length,
      completedOrders: this.ordersReport.reduce((sum, r) => sum + r.completedOrders, 0),
      cancelledOrders: this.ordersReport.reduce((sum, r) => sum + r.cancelledOrders, 0)
    };
  }

  get completionRate(): number {
    const total = this.ordersSummary.completedOrders + this.ordersSummary.cancelledOrders;
    if (total === 0) return 0;
    return (this.ordersSummary.completedOrders / total) * 100;
  }

  // Users Report
  loadUsersReport(): void {
    this.siteManagerService.getUsersReport(
      this.usersStartDate || undefined,
      this.usersEndDate || undefined
    ).subscribe({
      next: (data) => {
        this.usersReport = data;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load users report:', err);
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  getUserStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'active': 'Active',
      'ok': 'Active',
      'warned': 'Warned',
      'suspended': 'Suspended'
    };
    return labels[status] || status;
  }

  // Restaurants Report
  loadRestaurantsReport(): void {
    this.siteManagerService.getRestaurantsReport().subscribe({
      next: (data) => {
        this.restaurantsReport = data;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load restaurants report:', err);
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  getRestaurantStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'accepted': 'Active',
      'pending': 'Pending',
      'rejected': 'Rejected'
    };
    return labels[status] || status;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  }

  onBack(): void {
    this.router.navigate(['/admin']);
  }
}
