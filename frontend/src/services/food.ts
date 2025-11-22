import type { FoodResponse } from '../lib/menu.types';

const BASE = (import.meta.env.VITE_API_URL_COMIDA as string) || process.env.VITE_API_URL_COMIDA || '';

export async function fetchFood(): Promise<FoodResponse> {
  const url = `${BASE}/menu?limit=20`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`Fetch error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data as FoodResponse;
}
