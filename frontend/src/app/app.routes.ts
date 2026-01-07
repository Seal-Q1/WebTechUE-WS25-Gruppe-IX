import {Routes} from '@angular/router';
import {Home} from "./home/home";
import {MenuManagement} from "./restaurant-owner/menu-management/menu-management/menu-management";
import {ManageProfile} from "./restaurant-owner/manage-profile/manage-profile";
import {RestaurantList} from "./restaurant-owner/restaurant-list/restaurant-list";


export const routes: Routes = [
  {
    path: '',
    component: Home
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
  }
];
