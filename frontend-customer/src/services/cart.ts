/**
 * Servicio de carrito - E-Commerce Service
 *
 * Endpoints disponibles según Postman:
 * - POST /cart - Agregar item al carrito (productId, quantity)
 * - GET /cart - Obtener carrito actual
 * - PUT /cart - Actualizar cantidad de item
 * - DELETE /cart - Eliminar item o limpiar carrito
 *
 * Endpoint alternativo (si los anteriores fallan):
 * - POST /cart/sync - Sincronizar carrito completo
 */

import { ecommerceApi } from '../lib/api-client';

export interface CartItem {
  productId: string;
  name?: string;
  quantity: number;
  price?: number;
  subtotal?: number;
  imageUrl?: string;
}

export interface CartResponse {
  userId?: string;
  items: CartItem[];
  total: number;
  itemCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * POST /cart - Agregar item al carrito (requiere autenticación)
 * Body: { productId, quantity }
 */
export async function addToCart(productId: string, quantity: number = 1): Promise<CartResponse> {
  return await ecommerceApi.post<CartResponse>('/cart', {
    productId,
    quantity
  }, true);
}

/**
 * GET /cart - Obtener carrito actual (requiere autenticación)
 */
export async function getCart(): Promise<CartResponse> {
  return await ecommerceApi.get<CartResponse>('/cart', true);
}

/**
 * PUT /cart - Actualizar cantidad de un item (requiere autenticación)
 * Body: { productId, quantity }
 */
export async function updateCartItem(productId: string, quantity: number): Promise<CartResponse> {
  return await ecommerceApi.put<CartResponse>('/cart', {
    productId,
    quantity
  }, true);
}

/**
 * DELETE /cart - Limpiar todo el carrito (requiere autenticación)
 */
export async function clearCart(): Promise<{ message: string }> {
  return await ecommerceApi.delete<{ message: string }>('/cart', true);
}

/**
 * POST /cart/sync - Sincronizar carrito completo (respaldo)
 * Body: { items: [...], total }
 */
export async function syncCart(items: CartItem[]): Promise<CartResponse> {
  const total = items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
  return await ecommerceApi.post<CartResponse>('/cart/sync', {
    items,
    total
  }, true);
}

/**
 * Sincronizar carrito local con servidor
 * Intenta usar POST /cart para cada item, si falla usa /cart/sync
 */
export async function syncLocalCartToServer(items: CartItem[]): Promise<CartResponse | null> {
  if (items.length === 0) return null;

  console.log('🔄 Sincronizando carrito local al servidor...');

  // Primero intentar con POST /cart individual
  try {
    // Limpiar el carrito del servidor primero
    try {
      await clearCart();
    } catch (e) {
      // Ignorar si ya está vacío
    }

    // Agregar cada item
    let lastResult: CartResponse | null = null;
    for (const item of items) {
      lastResult = await addToCart(item.productId, item.quantity);
      console.log(`✅ Item ${item.productId} agregado al servidor`);
    }

    return lastResult;
  } catch (error) {
    console.warn('⚠️ POST /cart falló, intentando con /cart/sync:', error);

    // Fallback: usar /cart/sync
    try {
      const result = await syncCart(items);
      console.log('✅ Carrito sincronizado con /cart/sync');
      return result;
    } catch (syncError) {
      console.error('❌ Error en /cart/sync:', syncError);
      throw syncError;
    }
  }
}

export default {
  addToCart,
  getCart,
  updateCartItem,
  clearCart,
  syncCart,
  syncLocalCartToServer,
};
