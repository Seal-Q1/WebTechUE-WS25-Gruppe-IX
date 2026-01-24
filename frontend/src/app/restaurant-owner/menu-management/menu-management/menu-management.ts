import {Component, ChangeDetectorRef, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItemDto, CuisineDto } from '@shared/types';
import { MenuItemService } from '../../../services/menu-item-service';
import { CuisineService } from '../../../services/cuisine-service';
import { DishList } from '../dish-list/dish-list';
import { CuisineList } from '../cuisine-list/cuisine-list';
import { DishEditingOverlay, CuisineEditingOverlay } from '../../../shared/editing-overlay';
import type { DishFormData, CuisineFormData } from '../../../shared/editing-overlay';

@Component({
  selector: 'app-menu-management',
  imports: [DishList, CuisineList, DishEditingOverlay, CuisineEditingOverlay],
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
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.restaurantId = parseInt(this.route.snapshot.paramMap.get('restaurantId')!); //TODO replace this hack with proper session-auth etc.
  }

  fetchDishes(): void {
    this.menuItemService.getAllMenuItems(this.restaurantId).subscribe(data => {
      this.dishes = data;
      this.cdr.detectChanges();
    });
  }

  fetchCuisines(): void {
    this.cuisineService.getAllCuisines().subscribe(data => {
      this.cuisines = data;
      this.cdr.detectChanges();
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

  onSaveDish(data: DishFormData): void {
    if (this.selectedDish) {
      this.menuItemService.updateMenuItem(this.restaurantId, this.selectedDish.id, data).subscribe(() => {
        this.showDishForm = false;
        this.selectedDish = null;
        this.cdr.detectChanges();
        this.fetchDishes();
      });
    } else {
      this.menuItemService.createMenuItem(this.restaurantId, data).subscribe(() => {
        this.showDishForm = false;
        this.cdr.detectChanges();
        this.fetchDishes();
      });
    }
  }

  onCancelDish(): void {
    this.showDishForm = false;
    this.selectedDish = null;
  }

  onDeleteDish(dishId: number): void {
    this.menuItemService.deleteMenuItem(this.restaurantId, dishId).subscribe(() => {
      // Filter the dish immediately - dish-list will handle grid update via ngOnChanges
      this.dishes = this.dishes.filter(d => d.id !== dishId);
      this.cdr.detectChanges();
    });
  }

  onDeleteDishFromOverlay(dishId: number): void {
    this.onDeleteDish(dishId);
    this.showDishForm = false;
    this.selectedDish = null;
  }

  onAddCuisine(): void {
    this.selectedCuisine = null;
    this.showCuisineForm = true;
  }

  onEditCuisine(cuisine: CuisineDto): void {
    this.selectedCuisine = cuisine;
    this.showCuisineForm = true;
  }

  onSaveCuisine(data: CuisineFormData): void {
    if (this.selectedCuisine) {
      this.cuisineService.updateCuisine(this.selectedCuisine.id, data).subscribe(() => {
        this.showCuisineForm = false;
        this.selectedCuisine = null;
        this.cdr.detectChanges();
        this.fetchCuisines();
      });
    } else {
      this.cuisineService.createCuisine(data).subscribe(() => {
        this.showCuisineForm = false;
        this.cdr.detectChanges();
        this.fetchCuisines();
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
      this.cdr.detectChanges();
    });
  }

  onDeleteCuisineFromOverlay(cuisineId: number): void {
    this.onDeleteCuisine(cuisineId);
    this.showCuisineForm = false;
    this.selectedCuisine = null;
  }
}
