import { useEffect, useState, useCallback } from 'react';
import type { MenuItem, ProductApi } from '../lib/menu.types';
import { fetchFood } from '../services/food';

export function useMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFood();
      const mapped: MenuItem[] = data.products.map((p: ProductApi) => ({
        id: p.productId,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        image_url: p.imageUrl,
        available: p.available,
      }));
      setItems(mapped);
    } catch (err: any) {
      setError(err?.message || 'Error cargando menú');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, error, refresh: load } as const;
}
