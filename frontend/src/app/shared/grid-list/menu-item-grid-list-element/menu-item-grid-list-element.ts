import {Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ImageDisplay} from '../../image-display/image-display';
import {GridListElementBase} from '../grid-list-element';
import {GridListElementAbstract} from '../grid-list-element-abstract';
import {MenuItemDto} from '@shared/types';
import {MenuItemService} from '../../../services/menu-item-service';

@Component({
  selector: 'app-menu-item-grid-list-element',
  imports: [CommonModule, ImageDisplay, GridListElementAbstract],
  templateUrl: './menu-item-grid-list-element.html',
  styleUrl: './menu-item-grid-list-element.css',
})

export class MenuItemGridListElement extends GridListElementBase implements OnInit {
  @Input() menuItem!: MenuItemDto;
  @Output() itemClick = new EventEmitter<number>();

  imageDto: any = null;
  isLoading = false;

  constructor(
    private menuItemService: MenuItemService,
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
    this.menuItemService.getMenuItemImage(this.menuItem.restaurantId, this.menuItem.id).subscribe({
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
    return this.menuItem?.id ?? 0;
  }

  override get orderIndex(): number {
    return this.menuItem?.orderIndex ?? 0;
  }

  override get displayName(): string {
    return this.menuItem?.name ?? '';
  }

  onItemClicked(): void {
    this.itemClick.emit(this.id);
  }
}
