import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';
import { useCart } from '../hooks/useCart';

export function TenantSelector() {
  const { tenantId, tenantName, setTenantId, availableTenants } = useTenant();
  const { cartItems, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (newTenantId: string) => {
    if (newTenantId !== tenantId) {
      // Si hay items en el carrito, preguntar si desea limpiarlos
      if (cartItems.length > 0) {
        const confirmed = window.confirm(
          `Al cambiar de sede se vaciará tu carrito actual (${cartItems.length} items). ¿Deseas continuar?`
        );
        if (!confirmed) {
          setIsOpen(false);
          return;
        }
        await clearCart();
      }
      setTenantId(newTenantId);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors"
      >
        <MapPin size={18} className="text-red-600" />
        <span className="text-sm font-medium text-gray-800 max-w-[150px] truncate">
          {tenantName.replace('TGI Fridays - ', '')}
        </span>
        <ChevronDown size={16} className={`text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="p-3 border-b bg-gray-50">
            <p className="text-xs text-gray-500 uppercase font-semibold">Selecciona tu sede</p>
          </div>
          <div className="py-1">
            {Object.entries(availableTenants).map(([id, name]) => (
              <button
                key={id}
                onClick={() => handleSelect(id)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  id === tenantId ? 'bg-red-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <MapPin size={16} className={id === tenantId ? 'text-red-600' : 'text-gray-400'} />
                  <span className={`text-sm ${id === tenantId ? 'font-semibold text-red-600' : 'text-gray-700'}`}>
                    {name}
                  </span>
                </div>
                {id === tenantId && <Check size={16} className="text-red-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
