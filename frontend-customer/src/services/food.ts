/**
 * Servicio de menú - E-Commerce Service
 * Endpoints públicos (no requieren autenticación)
 *
 * IMPORTANTE: Los endpoints del backend devuelven:
 * { success: true, message: "...", data: { ... } }
 * El api-client.ts extrae automáticamente el "data"
 */

import { ecommerceApi } from '../lib/api-client';
import type { ProductApi, MenuResponse, CategoryResponse, SearchResponse, CategoriesResponse } from '../lib/menu.types';

/**
 * GET /menu - Listar todos los productos (público)
 * Backend devuelve: { products: [], page, limit }
 */
export async function fetchFood(page = 1, limit = 20): Promise<MenuResponse> {
  return await ecommerceApi.get<MenuResponse>(`/menu?page=${page}&limit=${limit}`, false);
}

/**
 * GET /menu/{category} - Productos por categoría (público)
 * Backend devuelve: { category, products: [], count }
 */
export async function fetchFoodByCategory(category: string): Promise<CategoryResponse> {
  return await ecommerceApi.get<CategoryResponse>(`/menu/${encodeURIComponent(category)}`, false);
}

/**
 * GET /menu/items/{itemId} - Detalle de producto (público)
 */
export async function fetchProductDetail(productId: string): Promise<ProductApi> {
  return await ecommerceApi.get<ProductApi>(`/menu/items/${productId}`, false);
}

/**
 * GET /menu/search?q=xxx - Buscar productos (público)
 * Backend devuelve: { query, results: number, products: [] }
 */
export async function searchProducts(query: string): Promise<SearchResponse> {
  return await ecommerceApi.get<SearchResponse>(`/menu/search?q=${encodeURIComponent(query)}`, false);
}

/**
 * GET /menu/categories - Listar categorías (público)
 * Backend devuelve: { categories: ["hamburguesas", "bebidas", ...] }
 */
export async function fetchCategories(): Promise<CategoriesResponse> {
  return await ecommerceApi.get<CategoriesResponse>('/menu/categories', false);
}

// Funciones de administración (requieren autenticación y rol admin)
// No se usan en el frontend de cliente

export async function createProduct(payload: {
  name: string;
  description: string;
  category: string;
  price: number;
  currency?: string;
  isAvailable?: boolean;
  preparationTimeMinutes?: number;
  imageUrl?: string;
  tags?: string[];
}): Promise<{ message: string; product: ProductApi }> {
  return await ecommerceApi.post<{ message: string; product: ProductApi }>('/menu/productos', payload, true);
}

export async function updateProduct(
  itemId: string,
  payload: {
    name?: string;
    price?: number;
    description?: string;
    category?: string;
    preparationTimeMinutes?: number;
    imageUrl?: string;
    tags?: string[];
  }
): Promise<{ message: string; productId: string }> {
  return await ecommerceApi.put<{ message: string; productId: string }>(`/menu/items/${itemId}`, payload, true);
}

export async function toggleProductAvailability(
  itemId: string,
  isAvailable: boolean
): Promise<{ message: string }> {
  return await ecommerceApi.put<{ message: string }>(`/menu/items/${itemId}/availability`, { isAvailable }, true);
}
