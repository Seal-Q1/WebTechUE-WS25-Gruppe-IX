import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import type {RegisterRequestDto, AddressDto} from '@shared/types';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  userData: RegisterRequestDto = {
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    address: undefined
  };
  address: AddressDto = {
    street: '',
    houseNr: '',
    postalCode: '',
    city: '',
    door: ''
  };
  confirmPassword = '';
  isLoading = false;
  errorMessage: string | null = null;
  showAddressFields = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  toggleAddressFields(): void {
    this.showAddressFields = !this.showAddressFields;
  }

  onSubmit(): void {
    // Validate all fields
    if (!this.userData.userName || !this.userData.firstName || !this.userData.lastName ||
        !this.userData.email || !this.userData.phone || !this.userData.password) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    // Validate password match
    if (this.userData.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    // Validate password length
    if (this.userData.password.length < 4) {
      this.errorMessage = 'Password must be at least 4 characters';
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.userData.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    // Include address if filled in
    if (this.showAddressFields && this.address.street && this.address.city) {
      this.userData.address = this.address;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.authService.register(this.userData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Registration failed. Please try again.';
      }
    });
  }
}
