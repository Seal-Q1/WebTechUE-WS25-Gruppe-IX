import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {SiteManagerService, UserWithStatus} from '../site-manager-service';
import {AuthService} from '../../services/auth.service';
import type {AuthUserDto} from '@shared/types';
import {AdminLayout} from '../admin-layout/admin-layout';

@Component({
  selector: 'app-user-moderation',
  imports: [CommonModule, FormsModule, AdminLayout],
  templateUrl: './user-moderation.html',
  styleUrl: './user-moderation.css',
})
export class UserModeration implements OnInit {
  users: UserWithStatus[] = [];
  filteredUsers: UserWithStatus[] = [];
  isLoading = true;
  error: string | null = null;
  success: string | null = null;

  statusFilter = 'all';
  searchQuery = '';

  get activeCount(): number {
    return this.users.filter(u => u.status === 'active').length;
  }

  get warnedCount(): number {
    return this.users.filter(u => u.status === 'warned').length;
  }

  get suspendedCount(): number {
    return this.users.filter(u => u.status === 'suspended').length;
  }

  showActionModal = false;
  actionType: 'warn' | 'suspend' | null = null;
  selectedUser: UserWithStatus | null = null;
  actionReason = '';

  // Admin management
  adminUsers: AuthUserDto[] = [];
  adminUserIds: Set<number> = new Set();
  currentUserId: number | null = null;

  constructor(
    private siteManagerService: SiteManagerService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadAdmins();
    this.loadCurrentUser();
  }

  loadCurrentUser = (): void => {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.currentUserId = currentUser.id;
    }
  };

  loadUsers = (): void => {
    this.isLoading = true;
    this.error = null;

    this.siteManagerService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.applyFilters();
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.error = 'Failed to load users';
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      }
    });
  };

  applyFilters = (): void => {
    let filtered = this.users;

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(u => u.status === this.statusFilter);
    }

    const query = this.searchQuery.toLowerCase();
    if (query) {
      filtered = filtered.filter(u =>
        u.userName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.firstName.toLowerCase().includes(query) ||
        u.lastName.toLowerCase().includes(query)
      );
    }

    this.filteredUsers = filtered;
  };

  onStatusFilterChange = (status: string): void => {
    this.statusFilter = status;
    this.applyFilters();
  };

  onSearchChange = (query: string): void => {
    this.searchQuery = query;
    this.applyFilters();
  };

  openWarnModal = (user: UserWithStatus): void => {
    this.selectedUser = user;
    this.actionType = 'warn';
    this.actionReason = '';
    this.showActionModal = true;
  };

  openSuspendModal = (user: UserWithStatus): void => {
    this.selectedUser = user;
    this.actionType = 'suspend';
    this.actionReason = '';
    this.showActionModal = true;
  };

  closeModal = (): void => {
    this.showActionModal = false;
    this.selectedUser = null;
    this.actionType = null;
    this.actionReason = '';
  };

  confirmAction = (): void => {
    if (!this.selectedUser || !this.actionType) return;

    if (!this.actionReason.trim()) {
      this.error = 'Please provide a reason for this action';
      this.changeDetectorRef.detectChanges();
      return;
    }

    const userId = this.selectedUser.id;
    const userName = this.selectedUser.userName;
    const action = this.actionType;
    const reason = this.actionReason;

    // Close modal immediately
    this.closeModal();

    if (action === 'warn') {
      this.siteManagerService.warnUser(userId, reason).subscribe({
        next: (updatedUser) => {
          this.success = `Warning sent to ${userName}`;
          this.updateUserLocally(userId, updatedUser);
          setTimeout(() => {
            this.success = null;
            this.changeDetectorRef.detectChanges();
          }, 3000);
        },
        error: (err) => {
          console.error('Failed to warn user:', err);
          this.error = 'Failed to warn user';
          this.changeDetectorRef.detectChanges();
        }
      });
    } else if (action === 'suspend') {
      this.siteManagerService.suspendUser(userId, reason).subscribe({
        next: (updatedUser) => {
          this.success = `${userName} has been suspended`;
          this.updateUserLocally(userId, updatedUser);
          setTimeout(() => {
            this.success = null;
            this.changeDetectorRef.detectChanges();
          }, 3000);
        },
        error: (err) => {
          console.error('Failed to suspend user:', err);
          this.error = 'Failed to suspend user';
          this.changeDetectorRef.detectChanges();
        }
      });
    }
  };

  activateUser = (user: UserWithStatus): void => {
    this.siteManagerService.activateUser(user.id).subscribe({
      next: (updatedUser) => {
        this.success = `${user.userName} has been reactivated`;
        this.updateUserLocally(user.id, updatedUser);
        setTimeout(() => {
          this.success = null;
          this.changeDetectorRef.detectChanges();
        }, 3000);
      },
      error: (err) => {
        console.error('Failed to activate user:', err);
        this.error = 'Failed to activate user';
        this.changeDetectorRef.detectChanges();
      }
    });
  };

  updateUserLocally = (userId: number, updatedUser: UserWithStatus): void => {
    const index = this.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      this.users[index] = updatedUser;
      this.applyFilters();
      this.changeDetectorRef.detectChanges();
    }
  };

  getStatusLabel = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  onBack = (): void => {
    this.router.navigate(['/admin']);
  };

  // Admin management methods
  loadAdmins = (): void => {
    this.authService.getAdmins().subscribe({
      next: (admins) => {
        this.adminUsers = admins;
        this.adminUserIds = new Set(admins.map(a => a.id));
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load admins:', err);
      }
    });
  };

  isUserAdmin = (userId: number): boolean => {
    return this.adminUserIds.has(userId);
  };

  isCurrentUser = (userId: number): boolean => {
    return this.currentUserId === userId;
  };

  canToggleAdmin = (user: UserWithStatus): boolean => {
    // Cannot remove own admin status
    if (this.isUserAdmin(user.id) && this.isCurrentUser(user.id)) {
      return false;
    }
    // Cannot make suspended user an admin
    if (!this.isUserAdmin(user.id) && user.status === 'suspended') {
      return false;
    }
    return true;
  };

  toggleAdminStatus = (user: UserWithStatus): void => {
    if (this.isUserAdmin(user.id)) {
      // Remove admin
      this.authService.removeAdmin(user.id).subscribe({
        next: () => {
          this.success = `${user.userName} has been removed from admin list`;
          this.loadAdmins();
          setTimeout(() => {
            this.success = null;
            this.changeDetectorRef.detectChanges();
          }, 3000);
        },
        error: (err) => {
          console.error('Failed to remove admin:', err);
          this.error = err.error?.error || 'Failed to remove admin';
          this.changeDetectorRef.detectChanges();
        }
      });
    } else {
      // Add admin
      this.authService.addAdmin(user.id).subscribe({
        next: () => {
          this.success = `${user.userName} has been added to admin list`;
          this.loadAdmins();
          setTimeout(() => {
            this.success = null;
            this.changeDetectorRef.detectChanges();
          }, 3000);
        },
        error: (err) => {
          console.error('Failed to add admin:', err);
          this.error = err.error?.error || 'Failed to add admin';
          this.changeDetectorRef.detectChanges();
        }
      });
    }
  };
}
