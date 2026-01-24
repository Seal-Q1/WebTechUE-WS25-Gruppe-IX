export interface MenuItemDto {
  id: number;
  restaurantId: number;
  name: string;
  price: number;
  description?: string;
  isDeleted?: boolean;
  orderIndex: number;
}
