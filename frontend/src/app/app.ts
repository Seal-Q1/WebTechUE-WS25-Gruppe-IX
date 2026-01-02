import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import {Userdemo} from './userdemo/userdemo';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Userdemo],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
