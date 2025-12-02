import { User, LogOut, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { WebSocketNotifications } from './WebSocketNotifications';

interface NavbarProps {
  currentPage?: string;
}

export function Navbar({ currentPage }: NavbarProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const profileName = (profile as any)?.firstName || (profile as any)?.nombre || (profile as any)?.name || (profile as any)?.correo_electronico || '';
  const profileRole = String(((profile as any)?.role ?? '').toString().toUpperCase());
  const showMainMenu = !profile || profileRole === 'USER';

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

                    {/* WebSocket Notifications - solo aparece cuando el usuario está logueado */}
                    <div className="relative">
                      <WebSocketNotifications />
                    </div>

                    <button onClick={signOut} className="p-2 rounded-lg hover:bg-gray-100" title="Cerrar sesión">
                      <LogOut size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <button onClick={() => navigate('/auth/login')} className="text-black underline">INGRESA</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu bar: admin navigation */}
      <nav className="bg-white border-t border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-16">
            {profile ? (
              <ul className="flex space-x-10 uppercase font-semibold text-sm">
                <li>
                  <button onClick={() => navigate('/dashboard')} className={`px-2 py-1 ${currentPage === '' ? 'text-red-600' : 'text-black hover:text-red-600'}`}>
                    DASHBOARD
                  </button>
                </li>
              </ul>
            ) : (
              <div className="text-gray-500 text-sm">Panel Administrativo</div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
