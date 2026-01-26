import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {RestaurantDto} from '@shared/types';
import {RestaurantStatusEnum} from '@shared/types/enums';
import {SiteManagerService} from '../site-manager-service';
import {AdminLayout} from '../admin-layout/admin-layout';

@Component({
  selector: 'app-restaurant-moderation',
  imports: [CommonModule, FormsModule, AdminLayout],
  templateUrl: './restaurant-moderation.html',
  styleUrl: './restaurant-moderation.css',
})
export class RestaurantModeration implements OnInit {
  restaurants: RestaurantDto[] = [];
  filteredRestaurants: RestaurantDto[] = [];
  isLoading = true;
  error: string | null = null;
  success: string | null = null;

  statusFilter = 'all';
  searchQuery = '';

  get pendingCount(): number {
    return this.restaurants.filter(r => r.status === 'pending').length;
  }

  get activeCount(): number {
    return this.restaurants.filter(r => r.status === 'accepted').length;
  }

  get rejectedCount(): number {
    return this.restaurants.filter(r => r.status === 'rejected').length;
  }

  showRejectModal = false;
  selectedRestaurant: RestaurantDto | null = null;
  rejectReason = '';

  constructor(
    private siteManagerService: SiteManagerService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants = (): void => {
    this.isLoading = true;
    this.error = null;

    this.siteManagerService.getAllRestaurants().subscribe({
      next: (data) => {
        this.restaurants = data;
        this.applyFilters();
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load restaurants:', err);
        this.error = 'Failed to load restaurants';
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      }
    });
  };

  applyFilters = (): void => {
    let filtered = this.restaurants;

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === this.statusFilter);
    }

    const query = this.searchQuery.toLowerCase();
    if (query) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.email.toLowerCase().includes(query) ||
        r.address.city.toLowerCase().includes(query)
      );
    }

    this.filteredRestaurants = filtered;
  };

  onStatusFilterChange = (status: string): void => {
    this.statusFilter = status;
    this.applyFilters();
  };

  onSearchChange = (query: string): void => {
    this.searchQuery = query;
    this.applyFilters();
  };

  approveRestaurant = (restaurant: RestaurantDto): void => {
    this.siteManagerService.approveRestaurant(restaurant.id).subscribe({
      next: () => {
        this.success = `${restaurant.name} has been approved successfully!`;
        this.loadRestaurants();
        setTimeout(() => {
          this.success = null;
          this.changeDetectorRef.detectChanges();
        }, 3000);
      },
      error: (err) => {
        console.error('Failed to approve restaurant:', err);
        this.error = 'Failed to approve restaurant';
        this.changeDetectorRef.detectChanges();
      }
    });
  };

  openRejectModal = (restaurant: RestaurantDto): void => {
    this.selectedRestaurant = restaurant;
    this.rejectReason = '';
    this.showRejectModal = true;
  };

  closeRejectModal = (): void => {
    this.showRejectModal = false;
    this.selectedRestaurant = null;
    this.rejectReason = '';
  };

  confirmReject = (): void => {
    if (!this.selectedRestaurant) return;

    this.siteManagerService.rejectRestaurant(this.selectedRestaurant.id, this.rejectReason).subscribe({
      next: () => {
        this.success = `${this.selectedRestaurant!.name} has been rejected.`;
        this.closeRejectModal();
        this.loadRestaurants();
        setTimeout(() => {
          this.success = null;
          this.changeDetectorRef.detectChanges();
        }, 3000);
      },
      error: (err) => {
        console.error('Failed to reject restaurant:', err);
        this.error = 'Failed to reject restaurant';
        this.changeDetectorRef.detectChanges();
      }
    });
  };

  getStatusLabel = (status: RestaurantStatusEnum): string => {
    switch (status) {
      case RestaurantStatusEnum.ACCEPTED:
        return 'Active';
      case RestaurantStatusEnum.PENDING:
        return 'Pending';
      case RestaurantStatusEnum.REJECTED:
        return 'Rejected';
      default:
        return status;
    }
  };

  onBack = (): void => {
    this.router.navigate(['/admin']);
  };
}
