import {Component, ChangeDetectorRef, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItemDto, CuisineDto } from '@shared/types';
import { MenuItemService } from '../../../services/menu-item-service';
import { CuisineService } from '../../../services/cuisine-service';
import { DishList } from '../dish-list/dish-list';
import { DishForm } from '../dish-form/dish-form';
import { CuisineList } from '../cuisine-list/cuisine-list';
import { CuisineForm } from '../cuisine-form/cuisine-form';

@Component({
  selector: 'app-menu-management',
  imports: [DishList, DishForm, CuisineList, CuisineForm],
  templateUrl: './menu-management.html',
  styleUrl: './menu-management.css',
})
export class MenuManagement implements OnInit {
  dishes: MenuItemDto[] = [];
  cuisines: CuisineDto[] = [];

  selectedDish: MenuItemDto | null = null;
  selectedCuisine: CuisineDto | null = null;

  showDishForm = false;
  showCuisineForm = false;

  restaurantId = 0;

  constructor(
    private menuItemService: MenuItemService,
    private cuisineService: CuisineService,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.restaurantId = parseInt(this.route.snapshot.paramMap.get('restaurantId')!); //TODO replace this hack with proper session-auth etc.
  }

  fetchDishes(): void {
    this.menuItemService.getAllMenuItems(this.restaurantId).subscribe(data => {
      this.dishes = data;
      this.changeDetectorRef.detectChanges();
    });
  }

  fetchCuisines(): void {
    this.cuisineService.getAllCuisines().subscribe(data => {
      this.cuisines = data;
      this.changeDetectorRef.detectChanges();
    });
  }

  onAddDish(): void {
    this.selectedDish = null;
    this.showDishForm = true;
  }

  onEditDish(dish: MenuItemDto): void {
    this.selectedDish = dish;
    this.showDishForm = true;
  }

  onSaveDish(data: { name: string; price: number; description?: string }): void {
    if (this.selectedDish) {
      this.menuItemService.updateMenuItem(this.restaurantId, this.selectedDish.id, data).subscribe(() => {
        this.fetchDishes();
        this.showDishForm = false;
        this.selectedDish = null;
      });
    } else {
      this.menuItemService.createMenuItem(this.restaurantId, data).subscribe(() => {
        this.fetchDishes();
        this.showDishForm = false;
      });
    }
  }

  onCancelDish(): void {
    this.showDishForm = false;
    this.selectedDish = null;
  }

  onDeleteDish(dishId: number): void {
    this.menuItemService.deleteMenuItem(this.restaurantId, dishId).subscribe(() => {
      this.dishes = this.dishes.filter(d => d.id !== dishId);
      this.changeDetectorRef.detectChanges();
    });
  }

  onAddCuisine(): void {
    this.selectedCuisine = null;
    this.showCuisineForm = true;
  }

  onEditCuisine(cuisine: CuisineDto): void {
    this.selectedCuisine = cuisine;
    this.showCuisineForm = true;
  }

  onSaveCuisine(data: { name: string; description?: string }): void {
    if (this.selectedCuisine) {
      this.cuisineService.updateCuisine(this.selectedCuisine.id, data).subscribe(() => {
        this.fetchCuisines();
        this.showCuisineForm = false;
        this.selectedCuisine = null;
      });
    } else {
      this.cuisineService.createCuisine(data).subscribe(() => {
        this.fetchCuisines();
        this.showCuisineForm = false;
      });
    }
  }

  onCancelCuisine(): void {
    this.showCuisineForm = false;
    this.selectedCuisine = null;
  }

  onDeleteCuisine(cuisineId: number): void {
    this.cuisineService.deleteCuisine(cuisineId).subscribe(() => {
      this.cuisines = this.cuisines.filter(c => c.id !== cuisineId);
      this.changeDetectorRef.detectChanges();
    });
  }
}
