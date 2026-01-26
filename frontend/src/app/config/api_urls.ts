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
  menuItemImageEndpoint: (restaurantId: number, itemId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}/menu-items/${itemId}/image`,
  menuItemsOrderEndpoint: (restaurantId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}/menu-items/order`,
  allCuisinesEndpoint: () =>
    `${environment.apiUrl}/cuisines`,
  cuisineEndpoint: (cuisineId: number) =>
    `${environment.apiUrl}/cuisines/${cuisineId}`,
  cuisinesOrderEndpoint: () =>
    `${environment.apiUrl}/cuisines/order`,
  allRestaurantsEndpoint: () =>
    `${environment.apiUrl}/restaurants`,
  restaurantEndpoint: (restaurantId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}`,
  restaurantProfileEndpoint: (restaurantId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}/manage-profile`,
  restaurantImageEndpoint: (restaurantId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}/image`,
  restaurantsOrderEndpoint: () =>
    `${environment.apiUrl}/restaurants/order`,

  // Admin endpoints
  adminStatsEndpoint: () =>
    `${environment.apiUrl}/admin/stats`,
  adminPendingRestaurantsEndpoint: () =>
    `${environment.apiUrl}/admin/restaurants/pending`,
  adminActiveRestaurantsEndpoint: () =>
    `${environment.apiUrl}/admin/restaurants/active`,
  adminApproveRestaurantEndpoint: (restaurantId: number) =>
    `${environment.apiUrl}/admin/restaurants/${restaurantId}/approve`,
  adminRejectRestaurantEndpoint: (restaurantId: number) =>
    `${environment.apiUrl}/admin/restaurants/${restaurantId}/reject`,
  adminUsersEndpoint: () =>
    `${environment.apiUrl}/admin/users`,
  adminWarnUserEndpoint: (userId: number) =>
    `${environment.apiUrl}/admin/users/${userId}/warn`,
  adminSuspendUserEndpoint: (userId: number) =>
    `${environment.apiUrl}/admin/users/${userId}/suspend`,
  adminActivateUserEndpoint: (userId: number) =>
    `${environment.apiUrl}/admin/users/${userId}/activate`,

  // Auth endpoints
  authLoginEndpoint: () =>
    `${environment.apiUrl}/auth/login`,
  authRegisterEndpoint: () =>
    `${environment.apiUrl}/auth/register`,
  authMeEndpoint: () =>
    `${environment.apiUrl}/auth/me`,
  authAdminsEndpoint: () =>
    `${environment.apiUrl}/auth/admins`,
  authAddAdminEndpoint: (userId: number) =>
    `${environment.apiUrl}/auth/admins/${userId}`,
}
