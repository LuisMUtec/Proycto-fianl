import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useMenu } from '../hooks/useMenu';

interface MenuPageProps {
  onNavigate: (page: string) => void;
}

export function MenuPage({ onNavigate: _onNavigate }: MenuPageProps) {
  const { items: menuItems, loading, error } = useMenu();
  const { addToCart } = useCart();

  // Derive categories dynamically from menu items and map to friendly labels
  const categoryLabelMap: Record<string, string> = {
    DRINK: 'Bebidas',
    FOOD: 'Comida',
    DESSERT: 'Postres',
    COMBO: 'Combos',
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

  const categories = (() => {
    const map = new Map<string, string>();
    for (const it of menuItems) {
      const key = (it.category || '').toUpperCase();
      if (!key) continue;
      if (!map.has(key)) {
        map.set(key, categoryLabelMap[key] ?? capitalize(key));
      }
    }
    return Array.from(map.entries()).map(([key, label]) => ({ id: key.toLowerCase(), name: label }));
  })();

  useEffect(() => {
    // If there is a hash on load, scroll smoothly to it
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

  const handleAddToCart = async (itemId: string) => {
    await addToCart(itemId, 1);
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
      {/* Full-width banner image with overlay */}
      <div className="relative w-full">
        <img
          src="https://frdadmin21.fridaysperu.com/media/wysiwyg/1762785431_CYBER_WEB.jpg"
          alt="Banner"
          className="w-full h-56 md:h-96 object-cover"
        />
        <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Horizontal category nav — clicking scrolls to section */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8 sticky top-20 z-20">
          <div className="flex gap-6 overflow-x-auto no-scrollbar px-2">
            {categories.map((c) => (
              <button key={c.id} onClick={() => {
                const el = document.getElementById(c.id);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                else window.location.hash = `#${c.id}`;
              }} className="whitespace-nowrap px-4 py-2 rounded-full font-medium bg-gray-100 hover:bg-gray-200">{c.name}</button>
            ))}
          </div>
        </div>

        {/* Sections: render each category as a full-width section */}
        <div className="space-y-12">
          {categories.map((c) => {
            const itemsForCat = menuItems.filter(i => (i.category || '').toLowerCase() === c.id.toLowerCase());
            return (
              <section id={c.id} key={c.id} className="">
                <h2 className="text-3xl font-bold mb-6">{c.name}</h2>
                {itemsForCat.length === 0 ? (
                  <div className="text-gray-600">No hay productos en esta sección.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {itemsForCat.map((item) => (
                      <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="relative h-56 overflow-hidden">
                          <img src={item.image_url || 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg'} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                            <span className="text-2xl font-bold text-red-600">S/ {item.price.toFixed(2)}</span>
                          </div>
                          <p className="text-gray-600 mb-4 text-sm leading-relaxed">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs px-3 py-1 rounded-full ${item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{item.available ? 'Disponible' : 'No disponible'}</span>
                            <button onClick={() => handleAddToCart(item.id)} disabled={!item.available} className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${item.available ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                              <Plus size={20} /> <span>Agregar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
