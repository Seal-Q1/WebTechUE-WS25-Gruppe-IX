import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {RestaurantDto} from '@shared/types';
import {DashboardStats, SiteManagerService} from '../site-manager-service';
import {AdminLayout} from '../admin-layout/admin-layout';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, AdminLayout],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  stats: DashboardStats | null = null;
  activeRestaurants: RestaurantDto[] = [];
  pendingRestaurants: RestaurantDto[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private siteManagerService: SiteManagerService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData = (): void => {
    this.isLoading = true;
    this.error = null;

    // Load statistics
    this.siteManagerService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
        this.stats = {
          totalOrders: 0,
          totalRevenue: 0,
          totalUsers: 0,
          totalRestaurants: 0,
          activeRestaurants: 0,
          pendingRestaurants: 0,
          ordersToday: 0,
          revenueToday: 0
        };
        this.changeDetectorRef.detectChanges();
      }
    });

    // Load active restaurants
    this.siteManagerService.getActiveRestaurants().subscribe({
      next: (data) => {
        this.activeRestaurants = data;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.siteManagerService.getAllRestaurants().subscribe({
          next: (data) => {
            this.activeRestaurants = data.filter(r => r.status === 'accepted');
            this.changeDetectorRef.detectChanges();
          },
          error: () => {
            this.activeRestaurants = [];
            this.changeDetectorRef.detectChanges();
          }
        });
      }
    });

    // Load pending restaurants
    this.siteManagerService.getPendingRestaurants().subscribe({
      next: (data) => {
        this.pendingRestaurants = data;
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.siteManagerService.getAllRestaurants().subscribe({
          next: (data) => {
            this.pendingRestaurants = data.filter(r => r.status === 'pending');
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
          },
          error: () => {
            this.pendingRestaurants = [];
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
          }
        });
      }
    });
  };

  quickApprove = (restaurantId: number): void => {
    this.siteManagerService.approveRestaurant(restaurantId).subscribe({
      next: () => {
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Failed to approve restaurant:', err);
        this.error = 'Failed to approve restaurant';
        this.changeDetectorRef.detectChanges();
      }
    });
  };

  quickReject = (restaurantId: number): void => {
    this.siteManagerService.rejectRestaurant(restaurantId).subscribe({
      next: () => {
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Failed to reject restaurant:', err);
        this.error = 'Failed to reject restaurant';
        this.changeDetectorRef.detectChanges();
      }
    });
  };

  onManageRestaurants = (): void => {
    this.router.navigate(['/admin/restaurants']);
  };

  onManageUsers = (): void => {
    this.router.navigate(['/admin/users']);
  };

  onGlobalSettings = (): void => {
    this.router.navigate(['/admin/settings']);
  };

  onReports = (): void => {
    this.router.navigate(['/admin/reports']);
  };
}
