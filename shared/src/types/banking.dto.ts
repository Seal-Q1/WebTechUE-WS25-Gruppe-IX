import type { AddressDto } from './address.dto';

// User address with ID and metadata
export interface UserAddressDto {
  id: number;
  userId: number;
  name: string;
  address: AddressDto;
  isDefault: boolean;
  createdAt?: string;
}

// For creating/updating addresses
export interface CreateUserAddressDto {
  name: string;
  address: AddressDto;
  isDefault?: boolean;
}

export interface UpdateUserAddressDto {
  name?: string;
  address?: AddressDto;
  isDefault?: boolean;
}

// Payment card types
export type CardType = 'visa' | 'mastercard' | 'amex' | 'discover' | 'other';

// Payment card (masked for security)
export interface PaymentCardDto {
  id: number;
  userId: number;
  cardName: string;
  cardHolderName: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  cardType: CardType;
  isDefault: boolean;
  createdAt?: string;
}

// For creating new cards
export interface CreatePaymentCardDto {
  cardName: string;
  cardHolderName: string;
  cardNumber: string; // Full number, will be masked on server
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  isDefault?: boolean;
}

// For updating card metadata (not the card number itself)
export interface UpdatePaymentCardDto {
  cardName?: string;
  cardHolderName?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}
