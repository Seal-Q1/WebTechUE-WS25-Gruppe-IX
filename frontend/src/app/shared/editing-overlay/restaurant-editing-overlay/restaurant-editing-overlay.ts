import {Component, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Observable} from 'rxjs';
import {AddressDto, ImageDto, OpeningHoursDto, RestaurantDto, RestaurantToServerDto} from '@shared/types';
import {RestaurantService} from '../../../services/restaurant-service';
import {EditingOverlayBase} from '../editing-overlay-base';
import {EditingOverlayAbstract} from '../editing-overlay-abstract';

export interface RestaurantFormData {
  name: string;
  phone: string;
  email: string;
  openingHours: OpeningHoursDto;
}

@Component({
  selector: 'app-restaurant-editing-overlay',
  imports: [FormsModule, CommonModule, EditingOverlayAbstract],
  templateUrl: './restaurant-editing-overlay.html',
  styleUrls: ['./restaurant-editing-overlay.css'],
})
export class RestaurantEditingOverlay extends EditingOverlayBase<RestaurantToServerDto> implements OnChanges {
  @Input() restaurant: RestaurantDto | null = null;
  @Input() restaurantId: number = 0;
  @Output() override save = new EventEmitter<RestaurantToServerDto>();
  @Output() override cancel = new EventEmitter<void>();
  @Output() override delete = new EventEmitter<number>();

  name = '';
  phone = '';
  email = '';
  address: AddressDto = {
    street: '',
    houseNr: '',
    door: undefined,
    city: '',
    postalCode: '',
  }
  openingHours: OpeningHoursDto = {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: ''
  };

  constructor(private restaurantService: RestaurantService) {
    super();
  }

  ngOnChanges(): void {
    if (this.restaurant) {
      this.name = this.restaurant.name;
      this.phone = this.restaurant.phone;
      this.email = this.restaurant.email;
      this.address = this.restaurant.address;
      if (this.restaurant.openingHours) {
        this.openingHours.monday = this.restaurant.openingHours.monday || '';
        this.openingHours.tuesday = this.restaurant.openingHours.tuesday || '';
        this.openingHours.wednesday = this.restaurant.openingHours.wednesday || '';
        this.openingHours.thursday = this.restaurant.openingHours.thursday || '';
        this.openingHours.friday = this.restaurant.openingHours.friday || '';
        this.openingHours.saturday = this.restaurant.openingHours.saturday || '';
        this.openingHours.sunday = this.restaurant.openingHours.sunday || '';
      }
    } else {
      this.resetForm();
    }
  }

  getTitle(): string {
    return this.restaurant ? 'Edit Restaurant Profile' : 'Add Restaurant';
  }

  isEditMode(): boolean {
    return !!this.restaurant;
  }

  onSave(): void {
    const openingHoursData: OpeningHoursDto = {};
    if (this.openingHours.monday) openingHoursData.monday = this.openingHours.monday;
    if (this.openingHours.tuesday) openingHoursData.tuesday = this.openingHours.tuesday;
    if (this.openingHours.wednesday) openingHoursData.wednesday = this.openingHours.wednesday;
    if (this.openingHours.thursday) openingHoursData.thursday = this.openingHours.thursday;
    if (this.openingHours.friday) openingHoursData.friday = this.openingHours.friday;
    if (this.openingHours.saturday) openingHoursData.saturday = this.openingHours.saturday;
    if (this.openingHours.sunday) openingHoursData.sunday = this.openingHours.sunday;

    const data: RestaurantToServerDto = {
      name: this.name,
      phone: this.phone,
      email: this.email,
      address: this.address,
      openingHours: openingHoursData
    };

    this.save.emit(data);
  }

  override onDelete(id?: number): void {
    if (this.restaurant) {
      super.onDelete(this.restaurant.id);
    }
  }

  fetchImage = (): Observable<ImageDto> => {
    return this.restaurantService.getRestaurantImage(this.restaurantId);
  };

  saveImage = (base64: string | null): Observable<ImageDto> => {
    return this.restaurantService.updateRestaurantImage(this.restaurantId, base64);
  };

  private resetForm(): void {
    this.name = '';
    this.phone = '';
    this.email = '';
    this.address = {
      street: '',
      houseNr: '',
      door: undefined,
      city: '',
      postalCode: ''
    }
    this.openingHours = {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    };
  }
}
