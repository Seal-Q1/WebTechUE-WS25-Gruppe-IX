export interface MenuItemDto {
  id: number;
  restaurantId: number;
  name: string;
  price: number;
  description?: string;
  picture?: string; //TODO ?
  isDeleted?: boolean;
}
