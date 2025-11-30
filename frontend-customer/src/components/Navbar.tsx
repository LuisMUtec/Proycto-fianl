import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Phone, ShoppingCart, Package, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { WebSocketNotifications } from './WebSocketNotifications';
import { TenantSelector } from './TenantSelector';

interface NavbarProps {
  currentPage?: string;
}

export function Navbar({ currentPage }: NavbarProps) {
  const { profile, signOut } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const profileName = (profile as any)?.nombre || (profile as any)?.name || (profile as any)?.correo_electronico || '';
  const profileRole = String(((profile as any)?.role ?? '').toString().toUpperCase());
  const showMainMenu = !profile || profileRole === 'USER';

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigateToOrders = () => {
    setIsUserMenuOpen(false);
    navigate('/orders');
  };

  const handleSignOut = () => {
    setIsUserMenuOpen(false);
    signOut();
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar: white background, black text, small height */}
      <div className="bg-white text-black shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-3 text-sm">
              <TenantSelector />
            </div>

            <div className="flex items-center justify-center">
              <button onClick={() => navigate('/')} aria-label="Ir al inicio" className="flex items-center">
                <img src="/logito.png" alt="TGI FRIDAYS" className="h-10" />
              </button>
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end space-x-2">
                  <div className="font-semibold">Call Center</div>
                  <Phone size={16} className="text-gray-600" />
                </div>
                <a href="tel:(01) 644 9099" className="text-red-600 font-medium">(01) 644 9099</a>
              </div>

              {profile ? (
                <>
                  <div className="flex items-center space-x-3">
                    {/* Dropdown de usuario */}
                    <div className="relative" ref={userMenuRef}>
                      <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="hidden sm:flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <User size={18} />
                        <div className="text-left">
                          <div className="text-sm font-medium">{profileName}</div>
                          <div className="text-xs text-gray-500 capitalize">{profileRole}</div>
                        </div>
                        <ChevronDown size={16} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Menú desplegable */}
                      {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">{profileName}</p>
                            <p className="text-xs text-gray-500">{(profile as any)?.correo_electronico || ''}</p>
                          </div>

                          <button
                            onClick={handleNavigateToOrders}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Package size={18} className="text-red-600" />
                            <span>Mis Pedidos</span>
                          </button>

                          <div className="border-t border-gray-100 mt-1 pt-1">
                            <button
                              onClick={handleSignOut}
                              className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <LogOut size={18} />
                              <span>Cerrar Sesión</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* WebSocket Notifications - solo aparece cuando el usuario está logueado */}
                    <div className="relative">
                      <WebSocketNotifications />
                    </div>

                    <button onClick={() => navigate('/cart')} className="relative p-2 rounded-lg hover:bg-gray-100" aria-label="Carrito">
                      <ShoppingCart size={20} className="text-gray-700" />
                      {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{itemCount}</span>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <button onClick={() => navigate('/auth/login')} className="text-black underline">INGRESA</button>
                  <button onClick={() => navigate('/cart')} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Carrito">
                    <ShoppingCart size={20} className="text-gray-700" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{itemCount}</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu bar: centered links for customer app */}
      <nav className="bg-white border-t border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-16">
            {showMainMenu ? (
              <ul className="flex space-x-10 uppercase font-semibold text-sm">
                <li>
                  <button onClick={() => navigate('/menu')} className={`px-2 py-1 ${currentPage === 'menu' ? 'text-red-600' : 'text-black hover:text-red-600'}`}>
                    CARTA
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/locales')} className={`px-2 py-1 ${currentPage === 'locales' ? 'text-red-600' : 'text-black hover:text-red-600'}`}>
                    LOCALES
                  </button>
                </li>
                <li>
                  <a href="https://fridays.mesa247.pe" target="_blank" rel="noreferrer" className="px-2 py-1 text-black hover:text-red-600">
                    RESERVAS
                  </a>
                </li>
              </ul>
            ) : null}
          </div>
        </div>
      </nav>
    </header>
  );
}
