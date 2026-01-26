import type {AddressDto} from './address.dto';

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface RegisterRequestDto {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  address?: AddressDto;
}

export interface AuthResponseDto {
  user: AuthUserDto;
  token: string;
}

export interface AuthUserDto {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  warningCount: number;
  address?: AddressDto;
}

export interface PasswordResetRequestDto {
  email: string;
}

export interface PasswordResetDto {
  token: string;
  newPassword: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: AddressDto;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
