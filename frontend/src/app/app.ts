import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import {PersistentNav} from './nav-components/persistent-nav/persistent-nav';
import {WarningModal} from './shared/warning-modal/warning-modal';
import {AuthService} from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [PersistentNav, WarningModal],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.css'
})

export class App implements OnInit, OnDestroy {
  protected readonly title = signal('frontend');
  showWarningModal = false;
  warningCount = 0;
  private warningSubscription?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.warningSubscription = this.authService.showWarning$.subscribe(warning => {
      this.showWarningModal = warning.show;
      this.warningCount = warning.warningCount;
    });
  }

  ngOnDestroy(): void {
    this.warningSubscription?.unsubscribe();
  }

  onWarningModalClosed(): void {
    this.authService.dismissWarning();
  }
}
