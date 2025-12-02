import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { WebSocketToast } from './components/WebSocketToast';
import { useAuth } from './contexts/AuthContext';

/**
 * Layout principal de la aplicación
 * Contiene el Navbar y el contenido de las rutas hijas vía Outlet
 */
export default function App() {
  const location = useLocation();
  const { profile } = useAuth();

  // Obtener la página actual desde la ruta
  const getCurrentPage = () => {
    const path = location.pathname.split('/')[1] || 'home';
    return path;
  };

  // Rutas que no deben mostrar el Navbar
  const hideNavbarRoutes = ['/auth', '/auth/login'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar currentPage={getCurrentPage()} />}
      <Outlet />
      {/* Toast de notificaciones - solo aparece cuando el usuario está logueado */}
      {profile && <WebSocketToast />}
    </>
  );
}
