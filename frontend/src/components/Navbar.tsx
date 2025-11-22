import { User, LogOut, MapPin, Phone, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  currentPage?: string;
}

export function Navbar({ currentPage }: NavbarProps) {
  const { profile, signOut } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const profileName = (profile as any)?.nombre || (profile as any)?.name || (profile as any)?.correo_electronico || '';
  const profileRole = String(((profile as any)?.role ?? '').toString().toUpperCase());

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar: white background, black text, small height */}
      <div className="bg-white text-black shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-3 text-sm">
              <MapPin size={18} className="text-red-600" />
              <span className="hidden sm:inline">¿Cómo deseas recibir tu pedido?</span>
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
                    <div className="hidden sm:flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-lg">
                      <User size={18} />
                      <div className="text-left">
                        <div className="text-sm font-medium">{profileName}</div>
                        <div className="text-xs text-gray-500 capitalize">{profileRole}</div>
                      </div>
                    </div>

                    <button onClick={signOut} className="p-2 rounded-lg hover:bg-gray-100" title="Cerrar sesión">
                      <LogOut size={18} />
                    </button>

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

      {/* Menu bar: centered links like the reference */}
      <nav className="bg-white border-t border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-16">
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
          </div>
        </div>
      </nav>
    </header>
  );
}
