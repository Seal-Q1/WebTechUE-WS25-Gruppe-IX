import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {RestaurantService} from '../../services/restaurant-service';
import type {AuthUserDto, AddressDto, UpdateProfileDto, ChangePasswordDto, RestaurantDto} from '@shared/types';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  user: AuthUserDto | null = null;
  
  // Profile form
  profileData: UpdateProfileDto = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: undefined
  };
  address: AddressDto = {
    street: '',
    houseNr: '',
    postalCode: '',
    city: '',
    door: ''
  };
  
  // Password change form
  passwordData: ChangePasswordDto = {
    currentPassword: '',
    newPassword: ''
  };
  confirmNewPassword = '';
  
  // UI state
  isLoadingProfile = false;
  isLoadingPassword = false;
  profileMessage: {type: 'success' | 'error'; text: string} | null = null;
  passwordMessage: {type: 'success' | 'error'; text: string} | null = null;
  
  // Restaurant data for restaurant owners
  userRestaurants: RestaurantDto[] = [];
  isLoadingRestaurants = false;

  constructor(
    private authService: AuthService,
    private restaurantService: RestaurantService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.user = this.authService.currentUserValue;
    if (this.user) {
      this.profileData = {
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        phone: this.user.phone
      };
      if (this.user.address) {
        this.address = {...this.user.address};
      }
      
      // Load user's restaurants
      this.loadUserRestaurants();
    }
  }

  loadUserRestaurants(): void {
    this.isLoadingRestaurants = true;
    this.restaurantService.getAllRestaurants().subscribe({
      next: (restaurants: RestaurantDto[]) => {
        // Filter restaurants owned by this user
        this.userRestaurants = restaurants.filter((r: RestaurantDto) => r.ownerId === this.user?.id);
        this.isLoadingRestaurants = false;
      },
      error: () => {
        this.isLoadingRestaurants = false;
      }
    });
  }

  onUpdateProfile(): void {
    this.isLoadingProfile = true;
    this.profileMessage = null;

    // Include address if any field is filled
    if (this.address.street || this.address.city) {
      this.profileData.address = this.address;
    }

    this.authService.updateProfile(this.profileData).subscribe({
      next: (user) => {
        this.isLoadingProfile = false;
        this.user = user;
        this.profileMessage = {type: 'success', text: 'Profile updated successfully!'};
      },
      error: (err) => {
        this.isLoadingProfile = false;
        this.profileMessage = {
          type: 'error',
          text: err.error?.error || 'Failed to update profile. Please try again.'
        };
      }
    });
  }

  onChangePassword(): void {
    // Validate
    if (!this.passwordData.currentPassword || !this.passwordData.newPassword) {
      this.passwordMessage = {type: 'error', text: 'Please fill in all password fields'};
      return;
    }

    if (this.passwordData.newPassword !== this.confirmNewPassword) {
      this.passwordMessage = {type: 'error', text: 'New passwords do not match'};
      return;
    }

    if (this.passwordData.newPassword.length < 4) {
      this.passwordMessage = {type: 'error', text: 'New password must be at least 4 characters'};
      return;
    }

    this.isLoadingPassword = true;
    this.passwordMessage = null;

    this.authService.changePassword(this.passwordData).subscribe({
      next: () => {
        this.isLoadingPassword = false;
        this.passwordMessage = {type: 'success', text: 'Password changed successfully!'};
        // Clear the form
        this.passwordData = {currentPassword: '', newPassword: ''};
        this.confirmNewPassword = '';
      },
      error: (err) => {
        this.isLoadingPassword = false;
        this.passwordMessage = {
          type: 'error',
          text: err.error?.error || 'Failed to change password. Please check your current password.'
        };
      }
    });
  }
}
