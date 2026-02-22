import {environment} from '../../environment/environment';

export const apiUrls = {
  userEndpoint: environment.apiUrl + "/users",
  allOrdersEndpoint: (restaurantId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}/orders`,
  ownOrderEndpoint: () =>
    `${environment.apiUrl}/orders/my`,
  orderEndpoint: (restaurantId: number, orderId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}/orders/${orderId}`,
  orderStatusEndpoint: (restaurantId: number, orderId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}/orders/${orderId}/status`,
  orderItemsEndpoint: (restaurantId: number, orderId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}/orders/${orderId}/items`,
  placeOrderEndpoint: () =>
    `${environment.apiUrl}/orders`,
  couponCodeEndpoint: (couponCode: string) =>
    `${environment.apiUrl}/loyalty/coupon-code/${couponCode}`,
  allMenuItemsEndpoint: (restaurantId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}/menu-items`,
  menuItemEndpoint: (restaurantId: number, itemId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}/menu-items/${itemId}`,
  menuItemImageEndpoint: (restaurantId: number, itemId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}/menu-items/${itemId}/image`,
  menuItemAggregateReviewsEndpoint: (restaurantId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}/menu-item-reviews/`,
  menuItemReviewEndpoint: (restaurantId: number, itemId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}/menu-items/${itemId}/reviews`,
  menuItemsOrderEndpoint: (restaurantId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}/menu-items/order`,
  allCuisinesEndpoint: () =>
    `${environment.apiUrl}/cuisines`,
  cuisineEndpoint: (cuisineId: number) =>
    `${environment.apiUrl}/cuisines/${cuisineId}`,
  cuisinesRestaurantMapEndpoint: () =>
    `${environment.apiUrl}/cuisines/restaurant`,
  cuisinesForRestaurantEndpoint: (restaurantId: number) =>
    `${environment.apiUrl}/cuisines/restaurant/${restaurantId}`,
  cuisinesOrderEndpoint: () =>
    `${environment.apiUrl}/cuisines/order`,
  allRestaurantsEndpoint: () =>
    `${environment.apiUrl}/restaurants`,
  restaurantEndpoint: (restaurantId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}`,
  restaurantAggregateReviewsEndpoint: () =>
    `${environment.apiUrl}/restaurants/reviews/`,
  restaurantReviewEndpoint: (restaurantId: number) =>
    `${environment.apiUrl}/restaurants/${restaurantId}/reviews`,
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

  // Platform Settings endpoints
  adminSettingsEndpoint: () =>
    `${environment.apiUrl}/admin/settings`,
  adminSettingEndpoint: (key: string) =>
    `${environment.apiUrl}/admin/settings/${key}`,

  // Delivery Zones endpoints
  adminDeliveryZonesEndpoint: () =>
    `${environment.apiUrl}/admin/delivery-zones`,
  adminDeliveryZoneEndpoint: (zoneId: number) =>
    `${environment.apiUrl}/admin/delivery-zones/${zoneId}`,

  // Vouchers endpoints
  adminVouchersEndpoint: () =>
    `${environment.apiUrl}/admin/vouchers`,
  adminVoucherEndpoint: (voucherId: number) =>
    `${environment.apiUrl}/admin/vouchers/${voucherId}`,

  // Reporting endpoints
  adminOrdersReportEndpoint: () =>
    `${environment.apiUrl}/admin/reports/orders`,
  adminUsersReportEndpoint: () =>
    `${environment.apiUrl}/admin/reports/users`,
  adminRestaurantsReportEndpoint: () =>
    `${environment.apiUrl}/admin/reports/restaurants`,

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
