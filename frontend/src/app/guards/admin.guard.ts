import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {AuthService} from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn() && this.authService.isAdmin()) {
      return true;
    }
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      // User is logged in but not admin
      this.router.navigate(['/']);
    }
    return false;
  }
}
