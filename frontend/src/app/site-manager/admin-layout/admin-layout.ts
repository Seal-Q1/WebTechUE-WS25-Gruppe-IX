import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  @Input() pageTitle = '';
  @Input() activePage: 'dashboard' | 'restaurants' | 'users' | 'settings' | 'reports' = 'dashboard';

  constructor(private router: Router) {}

  navigate(page: string): void {
    switch (page) {
      case 'dashboard':
        this.router.navigate(['/admin']);
        break;
      case 'restaurants':
        this.router.navigate(['/admin/restaurants']);
        break;
      case 'users':
        this.router.navigate(['/admin/users']);
        break;
      case 'settings':
        this.router.navigate(['/admin/settings']);
        break;
      case 'reports':
        this.router.navigate(['/admin/reports']);
        break;
    }
  }
}
