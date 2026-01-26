import {Component, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {RestaurantDto} from '@shared/types';
import {RestaurantService} from '../../services/restaurant-service';
import {GridList} from '../../shared/grid-list/grid-list';
import {RestaurantGridListElement} from '../../shared/grid-list/restaurant-grid-list-element/restaurant-grid-list-element';
import {RestaurantEditingOverlay} from '../../shared/editing-overlay';
import type {RestaurantFormData} from '../../shared/editing-overlay';

@Component({
  selector: 'app-restaurant-list',
  imports: [CommonModule, GridList, RestaurantGridListElement, RestaurantEditingOverlay],
  templateUrl: './restaurant-list.html',
  styleUrl: './restaurant-list.css',
})

export class RestaurantList {
  restaurants: RestaurantDto[] = [];
  showRestaurantOverlay = false;
  selectedRestaurant: RestaurantDto | null = null;
  reorderEnabled = true;

  constructor(
    private restaurantService: RestaurantService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  fetchRestaurants(): void {
    this.restaurantService.getAllRestaurants().subscribe((data) => {
      this.restaurants = data;
    });
  }

  onAddRestaurant(): void {
    this.selectedRestaurant = null;
    this.showRestaurantOverlay = true;
  }

  onSaveRestaurant(data: RestaurantFormData): void {
    if (this.selectedRestaurant) {
      this.restaurantService.updateRestaurantProfile(this.selectedRestaurant.id, data).subscribe(() => {
        this.showRestaurantOverlay = false;
        this.selectedRestaurant = null;
        this.fetchRestaurants();
      });
    } else {
      this.restaurantService.createRestaurant({
        name: data.name,
        phone: data.phone,
        email: data.email,
        locationName: '',
        address: { street: '', houseNr: '', postalCode: '', city: '', door: '' }
      }).subscribe(() => {
        this.showRestaurantOverlay = false;
        this.fetchRestaurants();
      });
    }
  }

  onCancelRestaurant(): void {
    this.showRestaurantOverlay = false;
    this.selectedRestaurant = null;
  }

  onItemClick(restaurantId: number): void {
    this.onEditMenu(restaurantId);
  }

  onSettingsClick(restaurantId: number): void {
    this.restaurantService.getRestaurantProfile(restaurantId).subscribe(profile => {
      this.selectedRestaurant = profile;
      this.showRestaurantOverlay = true;
      this.cdr.markForCheck();
    });
  }

  onDeleteRestaurantFromOverlay(restaurantId: number): void {
    this.restaurantService.deleteRestaurant(restaurantId).subscribe(() => {
      this.showRestaurantOverlay = false;
      this.selectedRestaurant = null;
      this.fetchRestaurants();
      this.cdr.markForCheck();
    });
  }

  onOrderChanged(orderUpdates: { id: number; orderIndex: number }[]): void {
    this.restaurantService.updateRestaurantsOrder(orderUpdates).subscribe();
  }

  onEditProfile(restaurantId: number): void {
    this.router.navigate([`/restaurants/${restaurantId}/manage-profile`]);
  }

  onEditMenu(restaurantId: number): void {
    this.router.navigate([`/restaurants/${restaurantId}/menu-management`]);
  }
}
