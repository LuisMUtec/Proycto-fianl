export interface ProductApi {
  imageUrl: string;
  available: boolean;
  updatedAt: string;
  tenantId: string;
  category: string;
  createdAt: string;
  price: number;
  description: string;
  ingredients?: string[];
  name: string;
  preparationTime?: number;
  productId: string;
}

export interface FoodResponse {
  products: ProductApi[];
  count: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  available: boolean;
}
