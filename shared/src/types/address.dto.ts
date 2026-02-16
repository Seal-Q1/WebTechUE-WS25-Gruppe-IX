export interface AddressDto {
  id?: number;
  street: string;
  houseNr: string;
  postalCode: string;
  city: string;
  door?: string | undefined;
  latitude?: number | undefined;
  longitude?: number | undefined;
}
