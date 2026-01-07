import { Routes } from '@angular/router';
import {Home} from "./home/home";
import {MenuManagement} from "./restaurant-owner/menu-management/menu-management/menu-management";


export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'restaurants/:restaurantId/menu-management',
    component: MenuManagement
  }
];
