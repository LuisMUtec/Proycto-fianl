export interface ProductApi {
  productId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;  // Backend usa isAvailable, NO available
  preparationTime?: number;
  ingredients?: string[];
  tags?: string[];
  tenant_id?: string;
  createdAt?: string;
  updatedAt?: string;
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

// Response types for API endpoints
export interface MenuResponse {
  products: ProductApi[];
  page: number;
  limit: number;
}

export interface CategoryResponse {
  category: string;
  products: ProductApi[];
  count: number;
}

export interface SearchResponse {
  query: string;
  results: number;  // Esto es el COUNT, no los productos
  products: ProductApi[];  // Los productos están aquí
}

// El backend devuelve un array simple de strings para categorías
export interface CategoriesResponse {
  categories: string[];  // Backend devuelve ["hamburguesas", "bebidas", ...]
}
