import {environment} from '../../environment/environment';

export const apiUrls = {
  userEndpoint: environment.apiUrl + "/users",
  orderEndpoint: (restaurantId: number) =>
    `${environment.apiUrl}/restaurant/${restaurantId}/orders`,
  orderItemsEndpoint: (orderId: number) =>
    `${environment.apiUrl}/orders/${orderId}/items`,
  menuItemEndpoint: (itemId: number) =>
    `${environment.apiUrl}/menu-items/${itemId}`
}
