import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {Subscription} from 'rxjs';
import {AuthService} from '../../services/auth.service';
import type {AuthUserDto} from '@shared/types';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  currentUser: AuthUserDto | null = null;
  private userSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
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

  onLogin = (): void => {
    this.router.navigate(['/login']);
  };

  onLogout = (): void => {
    this.authService.logout();
    this.router.navigate(['/']);
  };

  onProfile = (): void => {
    this.router.navigate(['/profile']);
  };

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
