import type {ImageDto} from "@shared/types/image.dto";

export interface MenuItemDto {
  id: number;
  restaurantId: number;
  name: string;
  price: number;
  description?: string;
  isDeleted?: boolean;
  orderIndex: number;
}

export interface MenuItemWithImageDto {
    menuItemDto: MenuItemDto;
    imageDto: ImageDto
}
