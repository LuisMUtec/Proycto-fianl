import { useEffect, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useMenuAdvanced } from '../hooks/useMenuAdvanced';

interface MenuPageProps {
  onNavigate: (page: string) => void;
}

export function MenuPage({ onNavigate: _onNavigate }: MenuPageProps) {
  const {
    items: menuItems,
    categories,
    selectedCategory,
    searchQuery,
    loading,
    error,
    changeCategory,
    search,
    clearSearch,
  } = useMenuAdvanced();

  const { addToCart } = useCart();
  const [localSearchInput, setLocalSearchInput] = useState('');

  // Derive display categories with friendly labels
  const categoryLabelMap: Record<string, string> = {
    hamburguesas: 'Hamburguesas',
    bebidas: 'Bebidas',
    postres: 'Postres',
    entradas: 'Entradas',
    promociones: 'Promociones',
    combos: 'Combos',
    ensaladas: 'Ensaladas',
    acompañamientos: 'Acompañamientos',
    DRINK: 'Bebidas',
    FOOD: 'Comida',
    DESSERT: 'Postres',
    COMBO: 'Combos',
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

  // categories viene como array de { id, name, count } desde useMenuAdvanced
  const displayCategories = [
    { id: 'ALL', name: 'Todas', count: 0 },
    ...categories.map((cat) => ({
      id: cat.id,
      name: categoryLabelMap[cat.id.toLowerCase()] || categoryLabelMap[cat.id] || capitalize(cat.id),
      count: cat.count || 0,
    })),
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchInput.trim()) {
      search(localSearchInput.trim());
    } else {
      clearSearch();
    }
  };

  const handleClearSearch = () => {
    setLocalSearchInput('');
    clearSearch();
  };

  useEffect(() => {
    const hash = window.location.hash?.replace('#', '');
    if (hash) {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const onHash = () => {
      const h = window.location.hash?.replace('#', '');
      if (h) {
        const el = document.getElementById(h);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const handleAddToCart = async (item: any) => {
    const result = await addToCart(item, 1);
    if (result?.success) {
      alert(`✅ ${item.name} agregado al carrito`);
    } else {
      alert('❌ Error al agregar al carrito');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="relative w-full">
        <img
          src="https://frdadmin21.fridaysperu.com/media/wysiwyg/1762785431_CYBER_WEB.jpg"
          alt="Banner"
          className="w-full h-56 md:h-96 object-cover"
        />
        <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Búsqueda */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={localSearchInput}
                onChange={(e) => setLocalSearchInput(e.target.value)}
                placeholder="Buscar productos por nombre..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {localSearchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Buscar
            </button>
          </form>
          {searchQuery && (
            <div className="mt-3 text-sm text-gray-600">
              Mostrando resultados para: <span className="font-semibold">"{searchQuery}"</span>
              <button onClick={handleClearSearch} className="ml-2 text-red-600 hover:underline">
                Limpiar búsqueda
              </button>
            </div>
          )}
        </div>

        {/* Categorías */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8 sticky top-20 z-20">
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-2">
            {displayCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => changeCategory(c.id)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full font-medium transition-colors ${
                  selectedCategory === c.id
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {c.name} {c.count > 0 && `(${c.count})`}
              </button>
            ))}
          </div>
        </div>

        {/* Productos */}
        {menuItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {searchQuery
                ? `No se encontraron productos para "${searchQuery}"`
                : 'No hay productos disponibles en esta categoría'}
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-bold mb-6">
              {searchQuery
                ? `Resultados de búsqueda (${menuItems.length})`
                : selectedCategory === 'ALL'
                ? `Todos los productos (${menuItems.length})`
                : `${displayCategories.find((c) => c.id === selectedCategory)?.name} (${menuItems.length})`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={
                        item.image_url ||
                        'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg'
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                      <span className="text-2xl font-bold text-red-600">
                        S/ {item.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          item.available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.available ? 'Disponible' : 'No disponible'}
                      </span>
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.available}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                          item.available
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <Plus size={20} /> <span>Agregar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
