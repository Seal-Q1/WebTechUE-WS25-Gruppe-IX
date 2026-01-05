import { Component } from '@angular/core';
import {Footer} from '../footer/footer';
import {RouterOutlet} from '@angular/router';
import {Navbar} from '../navbar/navbar';

@Component({
  selector: 'app-persistent-nav',
  imports: [
    Footer,
    RouterOutlet,
    Navbar
  ],
  templateUrl: './persistent-nav.html',
  styleUrl: './persistent-nav.css',
})

export class PersistentNav {

}
