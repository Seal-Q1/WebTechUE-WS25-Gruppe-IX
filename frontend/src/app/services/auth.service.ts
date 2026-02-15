import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {environment} from '../../environment/environment';
import type {AuthResponseDto, AuthUserDto, LoginRequestDto, RegisterRequestDto, UpdateProfileDto, ChangePasswordDto} from '@shared/types';

const AUTH_API_URL = environment.apiUrl + '/auth';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const WARNING_KEY = 'warning_shown';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private currentUserSubject = new BehaviorSubject<AuthUserDto | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  // Observable to notify when a warning should be shown
  private showWarningSubject = new BehaviorSubject<{show: boolean; warningCount: number}>({show: false, warningCount: 0});
  public showWarning$ = this.showWarningSubject.asObservable();

  // Callback to clear loyalty cache on logout
  private onLogoutCallback: (() => void) | null = null;

  constructor() {
    // Try to restore session on service init
    this.restoreSession();
  }

  // Method for LoyaltyService to register its cache clear callback
  registerLogoutCallback(callback: () => void): void {
    this.onLogoutCallback = callback;
  }

  private getStoredUser(): AuthUserDto | null {
    const userJson = localStorage.getItem(USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }

  private restoreSession(): void {
    const token = this.getToken();
    if (token) {
      this.getCurrentUser().subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        },
        error: () => {
          this.logout();
        }
      });
    }
  }

  login(credentials: LoginRequestDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${AUTH_API_URL}/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);

        // Check if user has warnings and hasn't dismissed the modal in this session
        if (response.user.warningCount > 0 && !sessionStorage.getItem(WARNING_KEY)) {
          this.showWarningSubject.next({show: true, warningCount: response.user.warningCount});
        }
      })
    );
  }

  dismissWarning(): void {
    sessionStorage.setItem(WARNING_KEY, 'true');
    this.showWarningSubject.next({show: false, warningCount: 0});
  }

  register(userData: RegisterRequestDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${AUTH_API_URL}/register`, userData).pipe(
      tap((response) => {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(WARNING_KEY);
    this.currentUserSubject.next(null);
    this.showWarningSubject.next({show: false, warningCount: 0});

    // Clear loyalty cache
    if (this.onLogoutCallback) {
      this.onLogoutCallback();
    }
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getAuthHeader() {
    return {headers: {"Authorization": "Bearer " + this.getToken()}}
  }

  getCurrentUser(): Observable<AuthUserDto> {
    return this.http.get<AuthUserDto>(`${AUTH_API_URL}/me`, this.getAuthHeader());
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.isAdmin ?? false;
  }

  get currentUserValue(): AuthUserDto | null {
    return this.currentUserSubject.value;
  }

  // Admin management methods
  addAdmin(userId: number): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${AUTH_API_URL}/admins/${userId}`, {}, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });
  }

  removeAdmin(userId: number): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${AUTH_API_URL}/admins/${userId}`, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });
  }

  getAdmins(): Observable<AuthUserDto[]> {
    return this.http.get<AuthUserDto[]>(`${AUTH_API_URL}/admins`, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });
  }

  // Profile management
  updateProfile(data: UpdateProfileDto): Observable<AuthUserDto> {
    return this.http.put<AuthUserDto>(`${AUTH_API_URL}/profile`, data, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    }).pipe(
      tap((user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  changePassword(data: ChangePasswordDto): Observable<{message: string}> {
    return this.http.put<{message: string}>(`${AUTH_API_URL}/change-password`, data, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });
  }

  getAccountStatus(): Observable<{warningCount: number; status: string}> {
    return this.http.get<{warningCount: number; status: string}>(`${AUTH_API_URL}/account-status`, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });
  }

  getWarnings(): Observable<{id: number; reason: string; createdAt: Date}[]> {
    return this.http.get<{id: number; reason: string; createdAt: Date}[]>(`${AUTH_API_URL}/warnings`, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });
  }

  requestPasswordReset(email: string): Observable<{message: string; resetToken?: string}> {
    return this.http.post<{message: string; resetToken?: string}>(`${AUTH_API_URL}/password-reset-request`, {email});
  }

  resetPassword(token: string, newPassword: string): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${AUTH_API_URL}/password-reset`, {token, newPassword});
  }
}
