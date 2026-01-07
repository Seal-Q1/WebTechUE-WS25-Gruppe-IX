import {Serializable} from './serializable.interface';
import type {UserDto} from '@shared/types';

export interface UserRow {
  user_id: number;
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export class UserSerializer extends Serializable<UserRow, UserDto> {
  serialize(row: UserRow): UserDto {
    return {
      id: row.user_id,
      userName: row.user_name,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone
    };
  }
}

export const userSerializer = new UserSerializer();
