export interface AddressDto {
  id?: number;
  street: string;
  houseNr: string;
  postalCode: string;
  city: string;
  door?: string | undefined;
  coordinates?: CoordinateDto;
}

export interface CoordinateDto {
    latitude: number;
    longitude: number;
}