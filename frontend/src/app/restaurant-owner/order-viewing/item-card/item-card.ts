import {Component, Input} from '@angular/core';
import {OrderItemDto} from '../../../dtos/orderItem.dto';
import {MenuItemDto} from '../../../dtos/menuItem.dto';
import {MenuItemService} from '../../../services/menu-item-service';

@Component({
  selector: 'app-item-card',
  imports: [],
  templateUrl: './item-card.html',
  styleUrl: './item-card.css',
})
export class ItemCard {
  @Input() orderItem!: OrderItemDto;
  menuItem: MenuItemDto | undefined;

  constructor(private menuItemService: MenuItemService) {}

    console.log("click");
    this.menuItemService.getMenuItem(this.orderItem.itemId).subscribe(item => {
        console.log('Menu item:', item);
        this.menuItem = this.deserializeMenuItemData(item);
      }
    );
  }

  }
}
