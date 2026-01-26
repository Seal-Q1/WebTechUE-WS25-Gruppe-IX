import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router, RouterLink, ActivatedRoute} from '@angular/router';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  // Request form
  email = '';
  
  // Reset form (when token is present)
  resetToken = '';
  newPassword = '';
  confirmPassword = '';
  
  // UI state
  isLoading = false;
  message: {type: 'success' | 'error'; text: string} | null = null;
  showResetForm = false;
  resetComplete = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Check if there's a reset token in the URL
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.resetToken = params['token'];
        this.showResetForm = true;
      }
    });
  }

  onRequestReset(): void {
    if (!this.email) {
      this.message = {type: 'error', text: 'Please enter your email address'};
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.message = {type: 'error', text: 'Please enter a valid email address'};
      return;
    }

    this.isLoading = true;
    this.message = null;

    this.authService.requestPasswordReset(this.email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.message = {type: 'success', text: response.message};
        
        // In development, if we got a token back, show the reset form
        if (response.resetToken) {
          this.resetToken = response.resetToken;
          setTimeout(() => {
            this.showResetForm = true;
            this.message = {type: 'success', text: 'Development mode: Token received. You can now reset your password.'};
          }, 1500);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.message = {
          type: 'error',
          text: err.error?.error || 'Failed to process request. Please try again.'
        };
      }
    });
  }

  onResetPassword(): void {
    if (!this.newPassword) {
      this.message = {type: 'error', text: 'Please enter a new password'};
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.message = {type: 'error', text: 'Passwords do not match'};
      return;
    }

    if (this.newPassword.length < 4) {
      this.message = {type: 'error', text: 'Password must be at least 4 characters'};
      return;
    }

    this.isLoading = true;
    this.message = null;

    this.authService.resetPassword(this.resetToken, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.resetComplete = true;
        this.message = {type: 'success', text: 'Password has been reset successfully! You can now log in.'};
      },
      error: (err) => {
        this.isLoading = false;
        this.message = {
          type: 'error',
          text: err.error?.error || 'Failed to reset password. The token may have expired.'
        };
      }
    });
  }
}
