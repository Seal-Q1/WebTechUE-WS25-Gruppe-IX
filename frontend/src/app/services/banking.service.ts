import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import type {
  UserAddressDto,
  CreateUserAddressDto,
  UpdateUserAddressDto,
  PaymentCardDto,
  CreatePaymentCardDto,
  UpdatePaymentCardDto
} from '@shared/types';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class BankingService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/user';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ===================
  // ADDRESS METHODS
  // ===================

  getAddresses(): Observable<UserAddressDto[]> {
    return this.http.get<UserAddressDto[]>(`${this.baseUrl}/addresses`, {
      headers: this.getHeaders()
    });
  }

  getAddress(addressId: number): Observable<UserAddressDto> {
    return this.http.get<UserAddressDto>(`${this.baseUrl}/addresses/${addressId}`, {
      headers: this.getHeaders()
    });
  }

  createAddress(data: CreateUserAddressDto): Observable<UserAddressDto> {
    return this.http.post<UserAddressDto>(`${this.baseUrl}/addresses`, data, {
      headers: this.getHeaders()
    });
  }

  updateAddress(addressId: number, data: UpdateUserAddressDto): Observable<UserAddressDto> {
    return this.http.put<UserAddressDto>(`${this.baseUrl}/addresses/${addressId}`, data, {
      headers: this.getHeaders()
    });
  }

  deleteAddress(addressId: number): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.baseUrl}/addresses/${addressId}`, {
      headers: this.getHeaders()
    });
  }

  setDefaultAddress(addressId: number): Observable<UserAddressDto> {
    return this.http.post<UserAddressDto>(`${this.baseUrl}/addresses/${addressId}/set-default`, {}, {
      headers: this.getHeaders()
    });
  }

  // ===================
  // PAYMENT CARD METHODS
  // ===================

  getCards(): Observable<PaymentCardDto[]> {
    return this.http.get<PaymentCardDto[]>(`${this.baseUrl}/cards`, {
      headers: this.getHeaders()
    });
  }

  getCard(cardId: number): Observable<PaymentCardDto> {
    return this.http.get<PaymentCardDto>(`${this.baseUrl}/cards/${cardId}`, {
      headers: this.getHeaders()
    });
  }

  addCard(data: CreatePaymentCardDto): Observable<PaymentCardDto> {
    return this.http.post<PaymentCardDto>(`${this.baseUrl}/cards`, data, {
      headers: this.getHeaders()
    });
  }

  updateCard(cardId: number, data: UpdatePaymentCardDto): Observable<PaymentCardDto> {
    return this.http.put<PaymentCardDto>(`${this.baseUrl}/cards/${cardId}`, data, {
      headers: this.getHeaders()
    });
  }

  deleteCard(cardId: number): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.baseUrl}/cards/${cardId}`, {
      headers: this.getHeaders()
    });
  }

  setDefaultCard(cardId: number): Observable<PaymentCardDto> {
    return this.http.post<PaymentCardDto>(`${this.baseUrl}/cards/${cardId}/set-default`, {}, {
      headers: this.getHeaders()
    });
  }
}
