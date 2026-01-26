import {Routes} from '@angular/router';
import {Home} from "./home/home";
import {MenuManagement} from "./restaurant-owner/menu-management/menu-management/menu-management";
import {ManageProfile} from "./restaurant-owner/manage-profile/manage-profile";
import {RestaurantList} from "./restaurant-owner/restaurant-list/restaurant-list";
import {Dashboard} from "./site-manager/dashboard/dashboard";
import {RestaurantModeration} from "./site-manager/restaurant-moderation/restaurant-moderation";
import {UserModeration} from "./site-manager/user-moderation/user-moderation";
import {RestaurantView} from './customer/restaurant-details/restaurant-view/restaurant-view.component';


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
    component: Dashboard
  },
  {
    path: 'admin/restaurants',
    component: RestaurantModeration
  },
  {
    path: 'admin/users',
    component: UserModeration
  }
];
