import { useEffect, useState } from 'react';
import adminService from '../../services/admin';

export function AdminStats() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await adminService.fetchDashboard();
        if (mounted) setData(res);
      } catch (err) {
        console.error('fetchDashboard', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-sm text-gray-600">Pedidos</h3>
          <p className="text-2xl font-bold">{data.stats?.totalOrders ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-sm text-gray-600">Activos</h3>
          <p className="text-2xl font-bold">{data.stats?.activeOrders ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-sm text-gray-600">Ingresos</h3>
          <p className="text-2xl font-bold">S/ {(data.stats?.totalRevenue ?? 0).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-sm text-gray-600">Clientes</h3>
          <p className="text-2xl font-bold">{data.stats?.totalCustomers ?? 0}</p>
        </div>
      </div>

      <div className="bg-white rounded p-4">
        <h4 className="font-medium mb-2">Pedidos recientes</h4>
        {Array.isArray(data.recentOrders) && data.recentOrders.length > 0 ? (
          <ul className="space-y-2">
            {data.recentOrders.map((o: any) => (
              <li key={o.id} className="flex justify-between">
                <div>#{o.order_number} — {o.customer_name}</div>
                <div>S/ {o.total_amount.toFixed(2)}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500">Sin pedidos recientes</div>
        )}
      </div>
    </div>
  );
}
