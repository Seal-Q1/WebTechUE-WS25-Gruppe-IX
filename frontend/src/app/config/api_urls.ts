import {environment} from '../../environment/environment';

export const apiUrls = {
  userEndpoint: environment.apiUrl + "/users",
  allOrdersEndpoint: (restaurantId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}/orders`,
  orderEndpoint: (restaurantId: number, orderId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}/orders/${orderId}`,
  orderStatusEndpoint: (restaurantId: number, orderId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}/orders/${orderId}/status`,
  orderItemsEndpoint: (restaurantId: number, orderId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}/orders/${orderId}/items`,
  allMenuItemsEndpoint: (restaurantId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}/menu-items`,
  menuItemEndpoint: (restaurantId: number, itemId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}/menu-items/${itemId}`,
  allCuisinesEndpoint: () =>
    `${environment.apiUrl}/cuisines`,
  cuisineEndpoint: (cuisineId: number) =>
    `${environment.apiUrl}/cuisines/${cuisineId}`,
  allRestaurantsEndpoint: () =>
    `${environment.apiUrl}/restaurants`,
  restaurantProfileEndpoint: (restaurantId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}/manage-profile`
}
