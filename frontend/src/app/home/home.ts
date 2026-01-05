import { Component } from '@angular/core';
import {ProfileList} from '../profile-list/profile-list';

@Component({
  selector: 'app-home',
  imports: [
    ProfileList
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {


}
