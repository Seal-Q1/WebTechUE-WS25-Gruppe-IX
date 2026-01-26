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
import {AdminGuard} from "./guards/admin.guard";
import {AuthGuard} from "./guards/auth.guard";


export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'restaurant/:restaurantId',
    component: RestaurantView
  },
  {
    path: 'order-confirmation',
    component: OrderConfirmation
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'forgot-password',
    component: ForgotPassword
  },
  {
    path: 'profile',
    component: Profile,
    canActivate: [AuthGuard]
  },
  {
    path: 'loyalty',
    component: LoyaltyDashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'loyalty/history',
    component: LoyaltyHistoryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'restaurants/:restaurantId/menu-management',
    component: MenuManagement
  },
  {
    path: 'restaurants/:restaurantId/manage-profile',
    component: ManageProfile
  },
  {
    path: 'restaurants',
    component: RestaurantList
  },
  {
    path: 'admin',
    component: Dashboard,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/restaurants',
    component: RestaurantModeration,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/users',
    component: UserModeration,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/settings',
    component: GlobalSettings,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/reports',
    component: Reporting,
    canActivate: [AdminGuard]
  }
];
