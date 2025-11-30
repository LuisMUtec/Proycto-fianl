import { useEffect, useState, useCallback } from 'react';
import type { MenuItem, ProductApi } from '../lib/menu.types';
import { fetchFood, fetchFoodByCategory, searchProducts, fetchCategories } from '../services/food';
import { useTenant } from '../contexts/TenantContext';

interface UseMenuAdvancedOptions {
  initialCategory?: string;
  autoLoad?: boolean;
}

export function useMenuAdvanced(options: UseMenuAdvancedOptions = {}) {
  const { initialCategory, autoLoad = true } = options;
  const { tenantId } = useTenant(); // Obtener el tenant seleccionado

  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; count: number }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper para mapear producto del backend a MenuItem del frontend
  const mapProduct = (p: ProductApi): MenuItem => ({
    id: p.productId,
    name: p.name,
    description: p.description || '',
    price: p.price,
    category: p.category,
    image_url: p.imageUrl,
    available: p.isAvailable, // Backend usa isAvailable
    tenant_id: p.tenant_id, // Mantener el tenant_id
  });

  // Cargar categorías
  const loadCategories = useCallback(async () => {
    try {
      const data = await fetchCategories();
      // Backend devuelve { categories: ["hamburguesas", "bebidas", ...] }
      // Es un array de strings, no objetos
      if (data.categories && Array.isArray(data.categories)) {
        const mapped = data.categories.map((cat: string) => ({
          id: cat,
          name: cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase(),
          count: 0, // No tenemos count del backend
        }));
        setCategories(mapped);
      }
    } catch (err: any) {
      console.error('Error loading categories:', err);
      // No bloquear la app si falla cargar categorías
    }
  }, []);

  // Cargar productos - filtrar por tenant_id seleccionado
  const loadItems = useCallback(async (category?: string, query?: string) => {
    setLoading(true);
    setError(null);
    try {
      let products: ProductApi[] = [];

      if (query && query.trim()) {
        // Búsqueda: backend devuelve { query, results: number, products: [] }
        const data = await searchProducts(query);
        products = data.products || [];
      } else if (category && category !== 'ALL') {
        // Por categoría: backend devuelve { category, products: [], count }
        const data = await fetchFoodByCategory(category);
        products = data.products || [];
      } else {
        // Todos: backend devuelve { products: [], page, limit }
        const data = await fetchFood();
        products = data.products || [];
      }

      // Filtrar productos por tenant_id seleccionado
      const filteredProducts = products.filter(p => p.tenant_id === tenantId);
      console.log(`🏪 Filtrando productos por tenant: ${tenantId} (${filteredProducts.length}/${products.length})`);

      const mapped = filteredProducts.map(mapProduct);
      setItems(mapped);
    } catch (err: any) {
      console.error('Error loading items:', err);
      setError(err?.message || 'Error cargando menú');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  // Cambiar categoría
  const changeCategory = useCallback((category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
    loadItems(category);
  }, [loadItems]);

  // Buscar productos
  const search = useCallback((query: string) => {
    setSearchQuery(query);
    setSelectedCategory('ALL');
    loadItems(undefined, query);
  }, [loadItems]);

  // Limpiar búsqueda
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    loadItems(selectedCategory);
  }, [selectedCategory, loadItems]);

  // Refrescar
  const refresh = useCallback(() => {
    loadItems(selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery, loadItems]);

  // Cargar inicial y cuando cambie el tenant
  useEffect(() => {
    if (autoLoad) {
      loadCategories();
      loadItems(initialCategory);
    }
  }, [autoLoad, initialCategory, loadCategories, loadItems, tenantId]); // Recargar cuando cambie tenantId

  return {
    items,
    categories,
    selectedCategory,
    searchQuery,
    loading,
    error,
    changeCategory,
    search,
    clearSearch,
    refresh,
  } as const;
}
