import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
// import { AdminDashboard } from '../components/sections/AdminDashboard';
import { KitchenDashboard } from '../components/sections/KitchenDashboard';
import { DeliveryDashboard } from '../components/sections/DeliveryDashboard';
import { UserDashboard } from '../components/sections/UserDashboard';
import { AdminStats } from '../components/admin/AdminStats';
import { AdminProducts } from '../components/admin/AdminProducts';
import { AdminOrders } from '../components/admin/AdminOrders';
import { AdminUsers } from '../components/admin/AdminUsers';

export function DashboardPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('');
  const [adminSubTab, setAdminSubTab] = useState<'stats' | 'products' | 'orders' | 'users'>('stats');

  useEffect(() => {
    if (profile) {
      const role = profile.role?.toUpperCase() || '';
      
      // Redirigir automáticamente según el rol
      if (role === 'ADMIN') {
        setActiveTab('admin');
      } else if (role === 'COOK') {
        setActiveTab('kitchen');
      } else if (role === 'DISPATCHER') {
        setActiveTab('delivery');
      } else if (role === 'USER') {
        // Mostrar vista de usuario dentro del dashboard
        setActiveTab('user');
      }
    }
  }, [profile]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const role = profile.role?.toUpperCase() || '';
  if (role === 'USER') {
    return <UserDashboard />;
  }

  const getRoleDisplay = () => {
    const role = profile?.role?.toUpperCase() || '';
    const roleMap: Record<string, string> = {
      'ADMIN': 'Administrador',
      'COOK': 'Cocinero',
      'DISPATCHER': 'Repartidor',
      'USER': 'Cliente',
    };
    return roleMap[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-gray-300">
                Bienvenido, <strong>{profile?.nombre || 'Usuario'}</strong> - {getRoleDisplay()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {role === 'ADMIN' && (
        <div className="container mx-auto px-4 py-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Vista General
            </button>
            <button
              onClick={() => setActiveTab('kitchen')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'kitchen'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Cocina
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'delivery'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Delivery
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 pb-8">
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded ${'hidden'}`} // placeholder to keep existing UI
              />
            </div>

            {/* Admin sub-tabs: Stats / Products (rendered inside dashboard) */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
              <div className="flex space-x-3 flex-wrap">
                <button onClick={() => setAdminSubTab('stats')} className={`px-4 py-2 rounded ${adminSubTab === 'stats' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}>
                  Estadísticas
                </button>
                <button onClick={() => setAdminSubTab('products')} className={`px-4 py-2 rounded ${adminSubTab === 'products' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}>
                  Productos
                </button>
                <button onClick={() => setAdminSubTab('orders')} className={`px-4 py-2 rounded ${adminSubTab === 'orders' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}>
                  Órdenes
                </button>
                <button onClick={() => setAdminSubTab('users')} className={`px-4 py-2 rounded ${adminSubTab === 'users' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}>
                  Usuarios
                </button>
              </div>
            </div>

            {adminSubTab === 'stats' && <AdminStats />}
            {adminSubTab === 'products' && <AdminProducts />}
            {adminSubTab === 'orders' && <AdminOrders />}
            {adminSubTab === 'users' && <AdminUsers />}
          </div>
        )}
        {activeTab === 'kitchen' && <KitchenDashboard />}
        {activeTab === 'delivery' && <DeliveryDashboard />}
        {activeTab === 'user' && <UserDashboard />}
      </div>
    </div>
  );
}

 
