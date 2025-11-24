import { useEffect, useState } from 'react';
import adminService from '../../services/admin';

export function AdminOrders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await adminService.listOrders();
        const data = res?.data || res || [];
        if (mounted) setOrders(data);
      } catch (err) {
        console.error('listOrders', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await adminService.updateOrderStatus(id, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch (err) {
      console.error('updateOrderStatus', err);
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Órdenes</h2>
      </div>

      <div className="bg-white rounded shadow">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-3">Orden</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Total</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b hover:bg-gray-50">
                <td className="p-3">#{o.order_number}</td>
                <td className="p-3">{o.customer_name}</td>
                <td className="p-3">S/ {o.total_amount?.toFixed?.(2) ?? o.total_amount}</td>
                <td className="p-3">{o.status}</td>
                <td className="p-3">
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="mr-2">
                    <option value="pending">pending</option>
                    <option value="preparing">preparing</option>
                    <option value="ready">ready</option>
                    <option value="delivered">delivered</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
