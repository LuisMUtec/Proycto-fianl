import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminPanelPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const role = (profile?.role || '').toString().toUpperCase();

  if (role !== 'ADMIN') {
    // redirect if not admin
    navigate('/');
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 bg-white p-4 rounded-lg shadow">
          <nav className="space-y-2 text-sm">
            <button onClick={() => navigate('/admin')} className="w-full text-left font-medium">Dashboard</button>
            <button onClick={() => navigate('/admin/products')} className="w-full text-left">Productos</button>
            <button onClick={() => navigate('/admin/orders')} className="w-full text-left">Órdenes</button>
            <button onClick={() => navigate('/admin/users')} className="w-full text-left">Usuarios</button>
            <button onClick={() => navigate('/admin/settings')} className="w-full text-left">Ajustes</button>
          </nav>
        </aside>

        <main className="lg:col-span-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
