import {Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ImageDisplay} from '../../image-display/image-display';
import {GridListElementBase} from '../grid-list-element';
import {RestaurantDto} from '@shared/types';
import {RestaurantService} from '../../../services/restaurant-service';

@Component({
  selector: 'app-restaurant-grid-list-element',
  imports: [CommonModule, ImageDisplay],
  templateUrl: './restaurant-grid-list-element.html',
  styleUrl: './restaurant-grid-list-element.css',
})
export class RestaurantGridListElement extends GridListElementBase implements OnInit {
  @Input() restaurant!: RestaurantDto;
  @Output() settingsClick = new EventEmitter<RestaurantGridListElement>();
  @Output() itemClick = new EventEmitter<number>();

  imageDto: any = null;
  isLoading = false;

  constructor(
    private restaurantService: RestaurantService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadImage();
  }

  loadImage(): void {
    this.imageDto = null;
    this.isLoading = true;
    this.cdr.detectChanges();
    this.restaurantService.getRestaurantImage(this.restaurant.id).subscribe({
      next: (dto) => {
        this.imageDto = dto;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.imageDto = null;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  override get id(): number {
    return this.restaurant?.id ?? 0;
  }

  override get orderIndex(): number {
    return this.restaurant?.orderIndex ?? 0;
  }

  override get displayName(): string {
    return this.restaurant?.name ?? '';
  }

  onSettingsClick(event: Event): void {
    event.stopPropagation();
    this.settingsClick.emit(this);
  }

  onItemClicked(): void {
    this.itemClick.emit(this.id);
  }
}
