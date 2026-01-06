import {Component} from '@angular/core';
import {OrderPollList} from '../restaurant-owner/order-viewing/order-poll-list/order-poll-list';

@Component({
  selector: 'app-home',
  imports: [
    OrderPollList
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
