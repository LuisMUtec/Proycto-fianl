import type { FoodResponse, ProductApi } from '../lib/menu.types';

const BASE = (import.meta.env.VITE_API_URL_COMIDA as string) ;

// Helper para obtener headers de autenticación
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchFood(): Promise<FoodResponse> {
  const url = `${BASE}/menu?limit=20`;
  console.log('fetchFood URL:', url);
  const res = await fetch(url, { method: 'GET' });
  console.log('fetchFood response status:', res.status);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('fetchFood error:', errorText);
    throw new Error(`Fetch error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data as FoodResponse;
}

// Listar productos por categoría (FOOD, DRINK, etc.)
export async function fetchFoodByCategory(category: string): Promise<FoodResponse> {
  const url = `${BASE}/menu/${category}`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`Fetch error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data as FoodResponse;
}

// Crear producto (requiere auth admin)
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
  const url = `${BASE}/menu/productos`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Create error: ${res.status}`);
  }
  return res.json();
}

// Editar producto (requiere auth admin)
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
  const url = `${BASE}/menu/items/${itemId}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Update error: ${res.status}`);
  }
  return res.json();
}

// Cambiar disponibilidad de producto (requiere auth admin)
export async function toggleProductAvailability(
  itemId: string,
  isAvailable: boolean
): Promise<{ message: string }> {
  const url = `${BASE}/menu/items/${itemId}/availability`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ isAvailable }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Availability error: ${res.status}`);
  }
  return res.json();
}
