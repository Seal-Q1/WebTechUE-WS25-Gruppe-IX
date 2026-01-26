import {Component} from '@angular/core';
import {RestaurantGrid} from '../customer/restarurants-overview/restaurant-grid/restaurant-grid.component';

@Component({
  selector: 'app-home',
  imports: [RestaurantGrid],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
