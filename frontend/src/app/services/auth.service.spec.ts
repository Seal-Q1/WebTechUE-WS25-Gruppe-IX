import {TestBed} from '@angular/core/testing';
import {AuthService} from './auth.service';
import {provideHttpClient} from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient()
      ]
    });
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false for isLoggedIn when no token', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should return false for isAdmin when not logged in', () => {
    expect(service.isAdmin()).toBeFalse();
  });

  it('should return null for currentUserValue when not logged in', () => {
    expect(service.currentUserValue).toBeNull();
  });

  it('should clear storage on logout', () => {
    localStorage.setItem('auth_token', 'test');
    localStorage.setItem('auth_user', '{}');
    service.logout();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });
});
