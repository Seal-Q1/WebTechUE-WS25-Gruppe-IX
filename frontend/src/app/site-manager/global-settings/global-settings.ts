import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {RestaurantDto} from '@shared/types';
import {DeliveryZone, SiteManagerService, Voucher} from '../site-manager-service';
import {AdminLayout} from '../admin-layout/admin-layout';

@Component({
  selector: 'app-global-settings',
  imports: [CommonModule, FormsModule, AdminLayout],
  templateUrl: './global-settings.html',
  styleUrl: './global-settings.css',
})
export class GlobalSettings implements OnInit {
  // Platform Settings
  settings: Record<string, string> = {};
  editingSettings = false;
  editedSettings: Record<string, string> = {};
  
  // Object.keys helper for template
  Object = Object;

  // Delivery Zones
  deliveryZones: DeliveryZone[] = [];
  showZoneModal = false;
  editingZone: DeliveryZone | null = null;
  zoneForm = {
    name: '',
    postalCodes: '',
    city: '',
    deliveryFee: 0,
    isActive: true
  };

  // Vouchers
  vouchers: Voucher[] = [];
  restaurants: RestaurantDto[] = [];
  showVoucherModal = false;
  editingVoucher: Voucher | null = null;
  voucherForm = {
    code: '',
    description: '',
    discountType: 'fixed' as 'fixed' | 'percentage',
    discountValue: 0,
    minOrderValue: 0,
    maxUses: null as number | null,
    startDate: '',
    endDate: '',
    isActive: true,
    restaurantId: null as number | null
  };

  isLoading = true;
  error: string | null = null;
  success: string | null = null;

  activeTab: 'settings' | 'zones' | 'vouchers' = 'settings';

  constructor(
    private siteManagerService: SiteManagerService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.isLoading = true;
    this.loadSettings();
    this.loadDeliveryZones();
    this.loadVouchers();
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.siteManagerService.getAllRestaurants().subscribe({
      next: (data) => {
        this.restaurants = data.filter(r => r.status === 'accepted');
        this.changeDetectorRef.detectChanges();
      },
      error: () => {}
    });
  }

  // Platform Settings
  loadSettings(): void {
    this.siteManagerService.getSettings().subscribe({
      next: (data) => {
        this.settings = data;
        this.editedSettings = {...data};
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load settings:', err);
        this.error = 'Failed to load settings';
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  startEditingSettings(): void {
    this.editedSettings = {...this.settings};
    this.editingSettings = true;
  }

  cancelEditingSettings(): void {
    this.editingSettings = false;
    this.editedSettings = {...this.settings};
  }

  saveSettings(): void {
    const changedKeys = Object.keys(this.editedSettings).filter(
      key => this.editedSettings[key] !== this.settings[key]
    );

    if (changedKeys.length === 0) {
      this.editingSettings = false;
      return;
    }

    let completed = 0;
    changedKeys.forEach(key => {
      this.siteManagerService.updateSetting(key, this.editedSettings[key]).subscribe({
        next: () => {
          completed++;
          this.settings[key] = this.editedSettings[key];
          if (completed === changedKeys.length) {
            this.success = 'Settings updated successfully';
            this.editingSettings = false;
            this.changeDetectorRef.detectChanges();
            setTimeout(() => {
              this.success = null;
              this.changeDetectorRef.detectChanges();
            }, 3000);
          }
        },
        error: () => {
          this.error = `Failed to update setting: ${key}`;
          this.changeDetectorRef.detectChanges();
        }
      });
    });
  }

  getSettingLabel(key: string): string {
    const labels: Record<string, string> = {
      'service_fee_percentage': 'Service Fee (%)',
      'delivery_fee_base': 'Base Delivery Fee (€)',
      'delivery_fee_per_km': 'Fee per Kilometer (€)',
      'min_order_value': 'Minimum Order Value (€)',
      'max_delivery_distance_km': 'Max Delivery Distance (km)'
    };
    return labels[key] || key;
  }

  // Delivery Zones
  loadDeliveryZones(): void {
    this.siteManagerService.getDeliveryZones().subscribe({
      next: (data) => {
        this.deliveryZones = data;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load delivery zones:', err);
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  openAddZoneModal(): void {
    this.editingZone = null;
    this.zoneForm = {
      name: '',
      postalCodes: '',
      city: '',
      deliveryFee: 0,
      isActive: true
    };
    this.showZoneModal = true;
  }

  openEditZoneModal(zone: DeliveryZone): void {
    this.editingZone = zone;
    this.zoneForm = {
      name: zone.name,
      postalCodes: zone.postalCodes.join(', '),
      city: zone.city,
      deliveryFee: zone.deliveryFee,
      isActive: zone.isActive
    };
    this.showZoneModal = true;
  }

  closeZoneModal(): void {
    this.showZoneModal = false;
    this.editingZone = null;
  }

  saveZone(): void {
    if (!this.zoneForm.name || !this.zoneForm.postalCodes || !this.zoneForm.city) {
      this.error = 'Please fill in all required fields';
      return;
    }

    const zoneData = {
      name: this.zoneForm.name,
      postalCodes: this.zoneForm.postalCodes.split(',').map(s => s.trim()),
      city: this.zoneForm.city,
      deliveryFee: this.zoneForm.deliveryFee,
      isActive: this.zoneForm.isActive
    };

    if (this.editingZone) {
      this.siteManagerService.updateDeliveryZone(this.editingZone.id, zoneData).subscribe({
        next: () => {
          this.success = 'Delivery zone updated';
          this.closeZoneModal();
          this.loadDeliveryZones();
          setTimeout(() => {
            this.success = null;
            this.changeDetectorRef.detectChanges();
          }, 3000);
        },
        error: () => {
          this.error = 'Failed to update delivery zone';
          this.changeDetectorRef.detectChanges();
        }
      });
    } else {
      this.siteManagerService.createDeliveryZone(zoneData).subscribe({
        next: () => {
          this.success = 'Delivery zone created';
          this.closeZoneModal();
          this.loadDeliveryZones();
          setTimeout(() => {
            this.success = null;
            this.changeDetectorRef.detectChanges();
          }, 3000);
        },
        error: () => {
          this.error = 'Failed to create delivery zone';
          this.changeDetectorRef.detectChanges();
        }
      });
    }
  }

  deleteZone(zone: DeliveryZone): void {
    if (!confirm(`Delete zone "${zone.name}"?`)) return;

    this.siteManagerService.deleteDeliveryZone(zone.id).subscribe({
      next: () => {
        this.success = 'Delivery zone deleted';
        this.loadDeliveryZones();
        setTimeout(() => {
          this.success = null;
          this.changeDetectorRef.detectChanges();
        }, 3000);
      },
      error: () => {
        this.error = 'Failed to delete delivery zone';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  toggleZoneStatus(zone: DeliveryZone): void {
    this.siteManagerService.updateDeliveryZone(zone.id, {isActive: !zone.isActive}).subscribe({
      next: () => {
        zone.isActive = !zone.isActive;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.error = 'Failed to update zone status';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  // Vouchers
  loadVouchers(): void {
    this.siteManagerService.getVouchers().subscribe({
      next: (data) => {
        this.vouchers = data;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load vouchers:', err);
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  openAddVoucherModal(): void {
    this.editingVoucher = null;
    this.voucherForm = {
      code: '',
      description: '',
      discountType: 'fixed',
      discountValue: 0,
      minOrderValue: 0,
      maxUses: null,
      startDate: '',
      endDate: '',
      isActive: true,
      restaurantId: null
    };
    this.showVoucherModal = true;
  }

  openEditVoucherModal(voucher: Voucher): void {
    this.editingVoucher = voucher;
    this.voucherForm = {
      code: voucher.code,
      description: voucher.description || '',
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      minOrderValue: voucher.minOrderValue || 0,
      maxUses: voucher.maxUses || null,
      startDate: voucher.startDate ? voucher.startDate.split('T')[0] : '',
      endDate: voucher.endDate ? voucher.endDate.split('T')[0] : '',
      isActive: voucher.isActive,
      restaurantId: voucher.restaurantId || null
    };
    this.showVoucherModal = true;
  }

  closeVoucherModal(): void {
    this.showVoucherModal = false;
    this.editingVoucher = null;
  }

  saveVoucher(): void {
    if (!this.voucherForm.code || this.voucherForm.discountValue <= 0) {
      this.error = 'Please fill in code and discount value';
      return;
    }

    const voucherData = {
      code: this.voucherForm.code,
      description: this.voucherForm.description || undefined,
      discountType: this.voucherForm.discountType,
      discountValue: this.voucherForm.discountValue,
      minOrderValue: this.voucherForm.minOrderValue || undefined,
      maxUses: this.voucherForm.maxUses || undefined,
      startDate: this.voucherForm.startDate || undefined,
      endDate: this.voucherForm.endDate || undefined,
      isActive: this.voucherForm.isActive,
      restaurantId: this.voucherForm.restaurantId || undefined
    };

    if (this.editingVoucher) {
      this.siteManagerService.updateVoucher(this.editingVoucher.id, voucherData).subscribe({
        next: () => {
          this.success = 'Voucher updated';
          this.closeVoucherModal();
          this.loadVouchers();
          setTimeout(() => {
            this.success = null;
            this.changeDetectorRef.detectChanges();
          }, 3000);
        },
        error: () => {
          this.error = 'Failed to update voucher';
          this.changeDetectorRef.detectChanges();
        }
      });
    } else {
      this.siteManagerService.createVoucher(voucherData).subscribe({
        next: () => {
          this.success = 'Voucher created';
          this.closeVoucherModal();
          this.loadVouchers();
          setTimeout(() => {
            this.success = null;
            this.changeDetectorRef.detectChanges();
          }, 3000);
        },
        error: () => {
          this.error = 'Failed to create voucher';
          this.changeDetectorRef.detectChanges();
        }
      });
    }
  }

  deleteVoucher(voucher: Voucher): void {
    if (!confirm(`Delete voucher "${voucher.code}"?`)) return;

    this.siteManagerService.deleteVoucher(voucher.id).subscribe({
      next: () => {
        this.success = 'Voucher deleted';
        this.loadVouchers();
        setTimeout(() => {
          this.success = null;
          this.changeDetectorRef.detectChanges();
        }, 3000);
      },
      error: () => {
        this.error = 'Failed to delete voucher';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  toggleVoucherStatus(voucher: Voucher): void {
    this.siteManagerService.updateVoucher(voucher.id, {isActive: !voucher.isActive}).subscribe({
      next: () => {
        voucher.isActive = !voucher.isActive;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.error = 'Failed to update voucher status';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  formatVoucherDiscount(voucher: Voucher): string {
    if (voucher.discountType === 'percentage') {
      return `${voucher.discountValue}%`;
    }
    return `€${voucher.discountValue.toFixed(2)}`;
  }

  onBack(): void {
    this.router.navigate(['/admin']);
  }
}
