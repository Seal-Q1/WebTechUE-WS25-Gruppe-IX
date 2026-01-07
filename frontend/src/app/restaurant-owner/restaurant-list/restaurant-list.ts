import {ChangeDetectorRef, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {RestaurantDto} from '@shared/types';
import {RestaurantService} from '../../services/restaurant-service';
import {RestaurantForm} from './restaurant-form/restaurant-form';

@Component({
  selector: 'app-restaurant-list',
  imports: [CommonModule, RestaurantForm],
  templateUrl: './restaurant-list.html',
  styleUrl: './restaurant-list.css',
})
export class RestaurantList {
  restaurants: RestaurantDto[] = [];
  showRestaurantForm = false;

  constructor(
    private restaurantService: RestaurantService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router
  ) {
  }

  fetchRestaurants(): void {
    this.restaurantService.getAllRestaurants().subscribe((data) => {
      this.restaurants = data;
      this.changeDetectorRef.detectChanges();
    });
  }

  onAddRestaurant(): void {
    this.showRestaurantForm = true;
  }

  onSaveRestaurant(data: {
    name: string;
    phone: string;
    email: string;
    locationName: string;
    address: { street: string; houseNr: string; postalCode: string; city: string; door: string }
  }): void {
    this.restaurantService.createRestaurant(data).subscribe(() => {
      this.fetchRestaurants();
      this.showRestaurantForm = false;
    });
  }

  onCancelRestaurant(): void {
    this.showRestaurantForm = false;
  }

  onEditProfile(restaurantId: number): void {
    this.router.navigate([`/restaurants/${restaurantId}/manage-profile`]);
  }

  onEditMenu(restaurantId: number): void {
    this.router.navigate([`/restaurants/${restaurantId}/menu-management`]);
  }

}
