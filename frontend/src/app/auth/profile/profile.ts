import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {RestaurantService} from '../../services/restaurant-service';
import {BankingService} from '../../services/banking.service';
import type {
  AuthUserDto, AddressDto, UpdateProfileDto, ChangePasswordDto, RestaurantDto,
  UserAddressDto, PaymentCardDto, CreateUserAddressDto, CreatePaymentCardDto
} from '@shared/types';

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
    phone: ''
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

  // === ADDRESSES ===
  addresses: UserAddressDto[] = [];
  isLoadingAddresses = false;
  showAddressForm = false;
  editingAddressId: number | null = null;
  addressForm: CreateUserAddressDto = {
    name: 'Home',
    address: { street: '', houseNr: '', postalCode: '', city: '', door: '' },
    isDefault: false
  };
  addressMessage: {type: 'success' | 'error'; text: string} | null = null;

  // === PAYMENT CARDS ===
  paymentCards: PaymentCardDto[] = [];
  isLoadingCards = false;
  showCardForm = false;
  editingCardId: number | null = null;
  cardForm: CreatePaymentCardDto = {
    cardName: 'My Card',
    cardHolderName: '',
    cardNumber: '',
    expiryMonth: 1,
    expiryYear: new Date().getFullYear() + 1,
    cvv: '',
    isDefault: false
  };
  cardMessage: {type: 'success' | 'error'; text: string} | null = null;

  // Expiry options
  months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  years = Array.from({length: 10}, (_, i) => new Date().getFullYear() + i);

  // === WARNINGS ===
  warnings: {id: number; reason: string; createdAt: Date}[] = [];
  accountStatus: {warningCount: number; status: string} | null = null;

  constructor(
    private authService: AuthService,
    private restaurantService: RestaurantService,
    private bankingService: BankingService,
    private router: Router,
    private cdr: ChangeDetectorRef
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
      
      // Initialize from user data
      this.addresses = this.user.addresses || [];
      this.paymentCards = this.user.paymentCards || [];
      
      // Load user's restaurants
      this.loadUserRestaurants();
      
      // Refresh addresses and cards from API
      this.loadAddresses();
      this.loadCards();
      
      // Load account status and warnings
      this.loadAccountStatus();
      this.loadWarnings();
    }
  }

  loadAccountStatus(): void {
    this.authService.getAccountStatus().subscribe({
      next: (status) => {
        this.accountStatus = status;
        this.cdr.detectChanges();
      },
      error: () => {
        // Silently fail - account status is optional
      }
    });
  }

  loadWarnings(): void {
    this.authService.getWarnings().subscribe({
      next: (warnings) => {
        this.warnings = warnings;
        this.cdr.detectChanges();
      },
      error: () => {
        // Silently fail - warnings are optional
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'ok': 'Active',
      'active': 'Active',
      'warned': 'Warned',
      'suspended': 'Suspended'
    };
    return labels[status] || status;
  }

  loadUserRestaurants(): void {
    this.isLoadingRestaurants = true;
    this.restaurantService.getAllRestaurants().subscribe({
      next: (restaurants: RestaurantDto[]) => {
        this.userRestaurants = restaurants.filter((r: RestaurantDto) => r.ownerId === this.user?.id);
        this.isLoadingRestaurants = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingRestaurants = false;
        this.cdr.detectChanges();
      }
    });
  }

  onUpdateProfile(): void {
    this.isLoadingProfile = true;
    this.profileMessage = null;

    this.authService.updateProfile(this.profileData).subscribe({
      next: (user) => {
        this.isLoadingProfile = false;
        this.user = user;
        this.addresses = user.addresses || [];
        this.paymentCards = user.paymentCards || [];
        this.profileMessage = {type: 'success', text: 'Profile updated successfully!'};
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingProfile = false;
        this.profileMessage = {
          type: 'error',
          text: err.error?.error || 'Failed to update profile. Please try again.'
        };
        this.cdr.detectChanges();
      }
    });
  }

  onChangePassword(): void {
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
        this.passwordData = {currentPassword: '', newPassword: ''};
        this.confirmNewPassword = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingPassword = false;
        this.passwordMessage = {
          type: 'error',
          text: err.error?.error || 'Failed to change password. Please check your current password.'
        };
        this.cdr.detectChanges();
      }
    });
  }

  // ===================
  // ADDRESS METHODS
  // ===================

  loadAddresses(): void {
    this.isLoadingAddresses = true;
    this.bankingService.getAddresses().subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        this.isLoadingAddresses = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingAddresses = false;
        this.cdr.detectChanges();
      }
    });
  }

  openAddressForm(address?: UserAddressDto): void {
    if (address) {
      this.editingAddressId = address.id;
      this.addressForm = {
        name: address.name,
        address: {...address.address},
        isDefault: address.isDefault
      };
    } else {
      this.editingAddressId = null;
      this.addressForm = {
        name: 'Home',
        address: { street: '', houseNr: '', postalCode: '', city: '', door: '' },
        isDefault: this.addresses.length === 0
      };
    }
    this.showAddressForm = true;
    this.addressMessage = null;
  }

  cancelAddressForm(): void {
    this.showAddressForm = false;
    this.editingAddressId = null;
    this.addressMessage = null;
  }

  saveAddress(): void {
    if (!this.addressForm.address.street || !this.addressForm.address.city || 
        !this.addressForm.address.houseNr || !this.addressForm.address.postalCode) {
      this.addressMessage = {type: 'error', text: 'Please fill in all required address fields'};
      return;
    }

    this.isLoadingAddresses = true;

    if (this.editingAddressId) {
      this.bankingService.updateAddress(this.editingAddressId, this.addressForm).subscribe({
        next: (updated) => {
          const idx = this.addresses.findIndex(a => a.id === this.editingAddressId);
          if (idx >= 0) this.addresses[idx] = updated;
          this.showAddressForm = false;
          this.editingAddressId = null;
          this.isLoadingAddresses = false;
          this.addressMessage = {type: 'success', text: 'Address updated!'};
          this.loadAddresses();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoadingAddresses = false;
          this.addressMessage = {type: 'error', text: err.error?.error || 'Failed to update address'};
          this.cdr.detectChanges();
        }
      });
    } else {
      this.bankingService.createAddress(this.addressForm).subscribe({
        next: (created) => {
          this.addresses.push(created);
          this.showAddressForm = false;
          this.isLoadingAddresses = false;
          this.addressMessage = {type: 'success', text: 'Address added!'};
          this.loadAddresses();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoadingAddresses = false;
          this.addressMessage = {type: 'error', text: err.error?.error || 'Failed to add address'};
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteAddress(addressId: number): void {
    if (!confirm('Are you sure you want to delete this address?')) return;

    this.bankingService.deleteAddress(addressId).subscribe({
      next: () => {
        this.addresses = this.addresses.filter(a => a.id !== addressId);
        this.addressMessage = {type: 'success', text: 'Address deleted'};
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.addressMessage = {type: 'error', text: err.error?.error || 'Failed to delete address'};
        this.cdr.detectChanges();
      }
    });
  }

  setDefaultAddress(addressId: number): void {
    this.bankingService.setDefaultAddress(addressId).subscribe({
      next: () => {
        this.loadAddresses();
        this.addressMessage = {type: 'success', text: 'Default address updated'};
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.addressMessage = {type: 'error', text: err.error?.error || 'Failed to set default address'};
        this.cdr.detectChanges();
      }
    });
  }

  // ===================
  // CARD METHODS
  // ===================

  loadCards(): void {
    this.isLoadingCards = true;
    this.bankingService.getCards().subscribe({
      next: (cards) => {
        this.paymentCards = cards;
        this.isLoadingCards = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingCards = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCardForm(): void {
    this.editingCardId = null;
    this.cardForm = {
      cardName: 'My Card',
      cardHolderName: this.user ? `${this.user.firstName} ${this.user.lastName}` : '',
      cardNumber: '',
      expiryMonth: new Date().getMonth() + 1,
      expiryYear: new Date().getFullYear() + 1,
      cvv: '',
      isDefault: this.paymentCards.length === 0
    };
    this.showCardForm = true;
    this.cardMessage = null;
  }

  cancelCardForm(): void {
    this.showCardForm = false;
    this.editingCardId = null;
    this.cardMessage = null;
  }

  saveCard(): void {
    if (!this.cardForm.cardHolderName || !this.cardForm.cardNumber || !this.cardForm.cvv) {
      this.cardMessage = {type: 'error', text: 'Please fill in all required card fields'};
      return;
    }

    const cleanNumber = this.cardForm.cardNumber.replace(/\s/g, '');
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      this.cardMessage = {type: 'error', text: 'Invalid card number'};
      return;
    }

    if (this.cardForm.cvv.length < 3 || this.cardForm.cvv.length > 4) {
      this.cardMessage = {type: 'error', text: 'CVV must be 3 or 4 digits'};
      return;
    }

    this.isLoadingCards = true;

    this.bankingService.addCard(this.cardForm).subscribe({
      next: (created) => {
        this.paymentCards.push(created);
        this.showCardForm = false;
        this.isLoadingCards = false;
        this.cardMessage = {type: 'success', text: 'Card added!'};
        this.loadCards();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingCards = false;
        this.cardMessage = {type: 'error', text: err.error?.error || 'Failed to add card'};
        this.cdr.detectChanges();
      }
    });
  }

  deleteCard(cardId: number): void {
    if (!confirm('Are you sure you want to delete this card?')) return;

    this.bankingService.deleteCard(cardId).subscribe({
      next: () => {
        this.paymentCards = this.paymentCards.filter(c => c.id !== cardId);
        this.cardMessage = {type: 'success', text: 'Card deleted'};
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cardMessage = {type: 'error', text: err.error?.error || 'Failed to delete card'};
        this.cdr.detectChanges();
      }
    });
  }

  setDefaultCard(cardId: number): void {
    this.bankingService.setDefaultCard(cardId).subscribe({
      next: () => {
        this.loadCards();
        this.cardMessage = {type: 'success', text: 'Default card updated'};
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cardMessage = {type: 'error', text: err.error?.error || 'Failed to set default card'};
        this.cdr.detectChanges();
      }
    });
  }

  formatCardNumber(last4: string): string {
    return `•••• •••• •••• ${last4}`;
  }
}
