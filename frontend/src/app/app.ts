import { Component, signal } from '@angular/core';

import {PersistentNav} from './nav-components/persistent-nav/persistent-nav';

@Component({
  selector: 'app-root',
  imports: [PersistentNav],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.css'
})

export class App {
  protected readonly title = signal('frontend');
}
