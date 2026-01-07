import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RestaurantDto} from '@shared/types';

@Component({
  selector: 'app-restaurant-form',
  imports: [FormsModule],
  templateUrl: './restaurant-form.html',
  styleUrl: './restaurant-form.css',
})
export class RestaurantForm {
  @Input() restaurant: RestaurantDto | null = null;
  @Output() save = new EventEmitter<{
    name: string;
    phone: string;
    email: string;
    locationName: string;
    address: { street: string; houseNr: string; postalCode: string; city: string; door: string }
  }>();
  @Output() cancel = new EventEmitter<void>();

  name = '';
  phone = '';
  email = '';
  locationName = '';
  addressStreet = '';
  addressHouseNr = '';
  addressPostalCode = '';
  addressCity = '';
  addressDoor = '';

  ngOnChanges(): void {
    if (this.restaurant) {
      this.name = this.restaurant.name;
      this.phone = this.restaurant.phone;
      this.email = this.restaurant.email;
      this.locationName = this.restaurant.locationName;
      this.addressStreet = this.restaurant.address.street;
      this.addressHouseNr = this.restaurant.address.houseNr;
      this.addressPostalCode = this.restaurant.address.postalCode;
      this.addressCity = this.restaurant.address.city;
      this.addressDoor = this.restaurant.address.door ?? '';
    } else {
      this.resetForm();
    }
  }

  onSubmit(): void {
    const data = {
      name: this.name,
      phone: this.phone,
      email: this.email,
      locationName: this.locationName,
      address: {
        street: this.addressStreet,
        houseNr: this.addressHouseNr,
        postalCode: this.addressPostalCode,
        city: this.addressCity,
        door: this.addressDoor
      }
    };
    this.save.emit(data);
    this.resetForm();
  }

  onCancel(): void {
    this.cancel.emit();
    this.resetForm();
  }

  resetForm(): void {
    this.name = '';
    this.phone = '';
    this.email = '';
    this.locationName = '';
    this.addressStreet = '';
    this.addressHouseNr = '';
    this.addressPostalCode = '';
    this.addressCity = '';
    this.addressDoor = '';
  }

}
