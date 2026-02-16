import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {AddressDto, ImageDto, OpeningHoursDto, RestaurantDto, RestaurantToServerDto} from '@shared/types';
import {Observable} from 'rxjs';
import {RestaurantService} from '../../services/restaurant-service';
import {DragAndDropImageArea} from '../../shared/drag-and-drop-image-area/drag-and-drop-image-area';

@Component({
  selector: 'app-manage-profile',
  imports: [FormsModule, CommonModule, DragAndDropImageArea],
  templateUrl: './manage-profile.html',
  styleUrl: './manage-profile.css',
})
export class ManageProfile implements OnInit {
  restaurantId: number = 0;
  restaurant: RestaurantDto | null = null;
  name = '';
  phone = '';
  email = '';
  address: AddressDto = {
    street: '',
    houseNr: '',
    door: undefined,
    city: '',
    postalCode: ''
  };
  openingHours: OpeningHoursDto = {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: ''
  };

  constructor(
    private route: ActivatedRoute,
    private restaurantService: RestaurantService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.restaurantId = parseInt(this.route.snapshot.paramMap.get('restaurantId')!);
  }

  loadRestaurantProfile = (): void => {
    this.restaurantService.getRestaurantProfile(this.restaurantId).subscribe((data) => {
      this.restaurant = data;
      this.name = data.name;
      this.phone = data.phone;
      this.email = data.email;
      this.address = data.address;
      if (data.openingHours) {
        this.openingHours.monday = data.openingHours.monday || '';
        this.openingHours.tuesday = data.openingHours.tuesday || '';
        this.openingHours.wednesday = data.openingHours.wednesday || '';
        this.openingHours.thursday = data.openingHours.thursday || '';
        this.openingHours.friday = data.openingHours.friday || '';
        this.openingHours.saturday = data.openingHours.saturday || '';
        this.openingHours.sunday = data.openingHours.sunday || '';
      }
      this.changeDetectorRef.detectChanges();
    });
  };

  onSubmit = (): void => { //TODO refactor?
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

    this.restaurantService.updateRestaurantProfile(this.restaurantId, data).subscribe((updatedRestaurant) => {
      this.restaurant = updatedRestaurant;
      this.changeDetectorRef.detectChanges();
    });
  };

  fetchImage = (): Observable<ImageDto> => {
    return this.restaurantService.getRestaurantImage(this.restaurantId);
  };

  saveImage = (base64: string | null): Observable<ImageDto> => {
    return this.restaurantService.updateRestaurantImage(this.restaurantId, base64);
  };
}
