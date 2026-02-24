import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {MenuItemDto} from '@shared/types';
import {MenuItemService} from './menu-item-service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private menuItemService = inject(MenuItemService)

  readonly localstorageName: string = "cart";
  private cart: WritableSignal<Map<number, CartItemDto[]>> = signal(this.loadCart())

  getCart(restaurantId: number) {
    return this.cart().get(restaurantId) ?? [];
  }

  getCartSize(restaurantId: number) {
    let count = 0;
    const restaurantCart = this.cart().get(restaurantId) ?? [];
    for(const item of restaurantCart) {
      count += item.quantity;
    }
    return count;
  }

  getItemQuantity(menuItem: MenuItemDto) {
    const restaurantCart = this.cart().get(menuItem.restaurantId) ?? [];
    let item = restaurantCart.find(el => this.isSameItem(el.itemInfo, menuItem));
    if(item) {
      return item.quantity;
    }
    return 0;
  }

  setCartEntry(menuItem: MenuItemDto, quantity: number) {
    if(quantity <= 0){
      this.deleteCartEntry(menuItem);
      return;
    }

    this.cart.update(currentCart => {
      const restaurantCart = currentCart.get(menuItem.restaurantId) ?? [];
      let existingItem = restaurantCart.find(el => this.isSameItem(el.itemInfo, menuItem));

      if(existingItem) {
        existingItem.quantity = quantity;
      }
      else {
        restaurantCart.push(new CartItemDto(menuItem, quantity));
      }

      currentCart.set(menuItem.restaurantId, restaurantCart);
      return currentCart;
    });

    this.writeToStorage();
  }

  deleteCartEntry(menuItem: MenuItemDto) {
    this.cart.update(currentCart => {
      const restaurantCart = currentCart.get(menuItem.restaurantId) ?? [];
      const removeIndex = restaurantCart.findIndex(el => this.isSameItem(el.itemInfo, menuItem));
      restaurantCart.splice(removeIndex, 1);
      currentCart.set(menuItem.restaurantId, restaurantCart);
      return currentCart;
    });
    this.writeToStorage();
  }

  clearCart(restaurantId: number) {
    this.cart.update(currentCart => {
      currentCart.set(restaurantId, []);
      return currentCart;
    });
    this.writeToStorage();
  }

  private loadCart(): Map<number, CartItemDto[]> {
    let storedString = localStorage.getItem(this.localstorageName);

    if (storedString) {
      try {
        const storedObject: (CartItemDto[])[] =  JSON.parse(storedString);
        let cartMap: Map<number, CartItemDto[]> = new Map();
        for(const restaurantCart of storedObject) {
          if(restaurantCart.length > 0) {
            for(let item of restaurantCart) {
              this.menuItemService.getMenuItem(item.itemInfo.restaurantId, item.itemInfo.id).subscribe(menuItem => {
                this.updateMenuItemInCart(menuItem)
              })
            }
            cartMap.set(restaurantCart[0].itemInfo.restaurantId, restaurantCart)
          }
        }
        return cartMap;
      }
      catch(err) {
        return new Map<number, CartItemDto[]>();
      }
    }
    return new Map<number, CartItemDto[]>();
  }

  private updateMenuItemInCart(menuItem: MenuItemDto) {
    this.cart.update(currentCart => {
      const restaurantCart = currentCart.get(menuItem.restaurantId) ?? [];
      let existingItem = restaurantCart.find(el => this.isSameItem(el.itemInfo, menuItem));
      if(existingItem) {
        existingItem.itemInfo = menuItem;
      }
      return currentCart;
    });
    this.writeToStorage();
  }

  private writeToStorage() {
    // Calling JSON.stringify on a map returns {} -> turn map to simple array
    let cartList: (CartItemDto[])[] = []
    for (const restaurantCart of this.cart().values()) {
      cartList.push(restaurantCart);
    }
    localStorage.setItem(this.localstorageName, JSON.stringify(cartList));
  }

  getTotalPrice(restaurantId: number) {
    const restaurantCart = this.cart().get(restaurantId) ?? [];

    let price = 0;
    for(let cartItem of restaurantCart) {
      price += cartItem.itemInfo.price * cartItem.quantity;
    }
    return price;
  }

  private isSameItem(a: MenuItemDto, b: MenuItemDto) {
    return a.restaurantId === b.restaurantId && a.id === b.id;
  }
}

export class CartItemDto {
  itemInfo: MenuItemDto;
  quantity: number;

  constructor(menuItem: MenuItemDto, quantity: number) {
    this.itemInfo = menuItem;
    this.quantity = quantity;
  }
}
