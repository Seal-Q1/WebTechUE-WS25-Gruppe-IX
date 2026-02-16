import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {RestaurantDto, RestaurantToServerDto} from '@shared/types';
import {RestaurantService} from '../../services/restaurant-service';
import {RestaurantGridList} from './restaurant-grid-list/restaurant-grid-list';
import {RestaurantEditingOverlay} from '../../shared/editing-overlay';

@Component({
  selector: 'app-restaurant-list',
  imports: [CommonModule, RestaurantGridList, RestaurantEditingOverlay],
  templateUrl: './restaurant-list.html',
  styleUrl: './restaurant-list.css',
})

export class RestaurantList implements OnInit {
  restaurants: RestaurantDto[] = [];
  showRestaurantOverlay = false;
  selectedRestaurant: RestaurantDto | null = null;

  constructor(
    private restaurantService: RestaurantService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchRestaurants();
  }

  fetchRestaurants(): void {
    this.restaurantService.getAllRestaurants().subscribe((data) => {
      setTimeout(() => { //HACK
        this.restaurants = data;
        this.cdr.markForCheck();
      });
    });
  }

  onAddRestaurant(): void {
    this.selectedRestaurant = null;
    this.showRestaurantOverlay = true;
  }

  onSaveRestaurant(data: RestaurantToServerDto): void {
    if (this.selectedRestaurant) {
      this.restaurantService.updateRestaurantProfile(this.selectedRestaurant.id, data).subscribe(() => {
        this.showRestaurantOverlay = false;
        this.selectedRestaurant = null;
        this.fetchRestaurants();
        this.cdr.markForCheck();
      });
    } else {
      this.restaurantService.createRestaurant({
        name: data.name,
        phone: data.phone,
        email: data.email,
        locationName: '',
        address: data.address,
      }).subscribe(() => {
        this.showRestaurantOverlay = false;
        this.fetchRestaurants();
        this.cdr.markForCheck();
      });
    }
  }

  onCancelRestaurant(): void {
    this.showRestaurantOverlay = false;
    this.selectedRestaurant = null;
  }

  onItemClick(restaurant: RestaurantDto): void {
    this.onEditMenu(restaurant.id);
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

  onEditProfile(restaurantId: number): void {
    this.router.navigate([`/restaurants/${restaurantId}/manage-profile`]);
  }

  onEditMenu(restaurantId: number): void {
    this.router.navigate([`/restaurants/${restaurantId}/menu-management`]);
  }
}
