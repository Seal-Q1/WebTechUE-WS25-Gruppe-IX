import {Injectable, signal} from '@angular/core';
import {MenuItemDto} from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  localstorage_name: string = "cart";
  cart = signal(this.loadCart())

  getItemQuantity(menuItem: MenuItemDto) {
    let item = this.cart().find(el => this.isSameItem(el.itemInfo, menuItem));
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
      let existingItem = currentCart.find(el => this.isSameItem(el.itemInfo, menuItem));

      if(existingItem) {
        return currentCart.map(cartItem => {
          if(this.isSameItem(cartItem.itemInfo, menuItem)) {
            return new CartItemDto(menuItem, quantity);
          }
          else {
            return cartItem
          }
        })
      }

      return currentCart.concat([new CartItemDto(menuItem, quantity)]);
    })

    this.writeToStorage();
  }

  deleteCartEntry(menuItem: MenuItemDto) {
    this.cart.update(currentCart => currentCart.filter(
      el => !this.isSameItem(el.itemInfo, menuItem)
    ));
    this.writeToStorage();
  }

  clearCart() {
    this.cart.update(currentCart => [])
  }

  private loadCart(): CartItemDto[] {
    let localstorage_string = localStorage.getItem(this.localstorage_name)

    if (localstorage_string) {
      try {
        return JSON.parse(localstorage_string);
      }
      catch(err) {
        return [];
      }
    }
    return [];
  }

  private writeToStorage() {
    localStorage.setItem(this.localstorage_name, JSON.stringify(this.cart()));
  }

  getTotalPrice() {
    let price = 0;
    for(let cartItem of this.cart()) {
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
