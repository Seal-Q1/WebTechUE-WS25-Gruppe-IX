import {Routes} from '@angular/router';
import {Home} from "./home/home";
import {MenuManagement} from "./restaurant-owner/menu-management/menu-management/menu-management";
import {ManageProfile} from "./restaurant-owner/manage-profile/manage-profile";
import {RestaurantList} from "./restaurant-owner/restaurant-list/restaurant-list";
import {Dashboard} from "./site-manager/dashboard/dashboard";
import {RestaurantModeration} from "./site-manager/restaurant-moderation/restaurant-moderation";
import {UserModeration} from "./site-manager/user-moderation/user-moderation";
import {RestaurantView} from './customer/restaurant-details/restaurant-view/restaurant-view.component';
import {OrderConfirmation} from './customer/order-confirmation/order-confirmation.component';
import {GlobalSettings} from "./site-manager/global-settings/global-settings";
import {Reporting} from "./site-manager/reporting/reporting";
import {Login} from "./auth/login/login";
import {Register} from "./auth/register/register";
import {ForgotPassword} from "./auth/forgot-password/forgot-password";
import {Profile} from "./auth/profile/profile";
import {LoyaltyDashboardComponent} from "./loyalty/loyalty-dashboard/loyalty-dashboard";
import {LoyaltyHistoryComponent} from "./loyalty/loyalty-history/loyalty-history";
import {AdminGuard} from "./guards";
import {AuthGuard} from "./guards";
import {environment} from '../environment/environment';
import {CheckoutModal} from './customer/checkout-modal/checkout-modal.component';
import {OrderOverview} from './customer/order-overview/order-overview';
import {RestaurantOwnerGuard} from './guards';


export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: environment.appName
  },
  {
    path: 'restaurant/:restaurantId',
    component: RestaurantView,
    title: 'Restaurant Details'
  },
  {
    path: 'orders',
    component: OrderOverview,
    title: 'My Orders',
    canActivate: [AuthGuard],
  },
  {
    path: 'checkout',
    component: CheckoutModal,
    title: 'Checkout',
    canActivate: [AuthGuard],
  },
  {
    path: 'order-confirmation',
    component: OrderConfirmation,
    title: 'Order Confirmation',
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    component: Login,
    title: 'Login'
  },
  {
    path: 'register',
    component: Register,
    title: 'Register'
  },
  {
    path: 'forgot-password',
    component: ForgotPassword,
    title: 'Reset Password'
  },
  {
    path: 'profile',
    component: Profile,
    title: 'Profile',
    canActivate: [AuthGuard]
  },
  {
    path: 'loyalty',
    component: LoyaltyDashboardComponent,
    title: 'Loyalty Dashboard',
    canActivate: [AuthGuard]
  },
  {
    path: 'loyalty/history',
    component: LoyaltyHistoryComponent,
    title: 'Loyalty History',
    canActivate: [AuthGuard]
  },
  {
    path: 'restaurants/:restaurantId/menu-management',
    component: MenuManagement,
    title: 'Restaurant Menu Management',
    canActivate: [RestaurantOwnerGuard]
  },
  {
    path: 'restaurants/:restaurantId/manage-profile',
    component: ManageProfile,
    title: 'Restaurant Profile Management',
    canActivate: [RestaurantOwnerGuard]
  },
  {
    path: 'restaurants',
    component: RestaurantList,
    title: 'Restaurant List',
    canActivate: [RestaurantOwnerGuard]
  },
  {
    path: 'admin',
    component: Dashboard,
    title: 'Admin Dashboard',
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/restaurants',
    component: RestaurantModeration,
    title: 'Restaurant Moderation',
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/users',
    component: UserModeration,
    title: 'User Moderation',
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/settings',
    component: GlobalSettings,
    title: 'Global Settings',
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/reports',
    component: Reporting,
    title: 'Reports',
    canActivate: [AdminGuard]
  }
];
