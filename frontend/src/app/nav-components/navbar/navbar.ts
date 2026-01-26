import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faBurger, faStar, faUser, faUserTie, faUtensils} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-navbar',
  imports: [
    FaIconComponent
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  constructor(private router: Router) {
  }

  onHomeClicked() {
    this.router.navigate(['/']);
  }

  onRestaurants = (): void => {
    this.router.navigate(['/restaurants']);
  };

  onAdmin = (): void => {
    this.router.navigate(['/admin']);
  };
  protected readonly faUtensils = faUtensils;
  protected readonly faBurger = faBurger;
  protected readonly faUser = faUser;
  protected readonly faUserTie = faUserTie;
  protected readonly faStar = faStar;
}
