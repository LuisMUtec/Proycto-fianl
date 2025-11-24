import { useEffect, useState } from 'react';
import adminService from '../../services/admin';

export function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await adminService.listUsers();
        const data = res?.data || res || [];
        if (mounted) setUsers(data);
      } catch (err) {
        console.error('listUsers', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const changeRole = async (id: string, role: string) => {
    try {
      await adminService.updateUserRole(id, role);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    } catch (err) {
      console.error('updateUserRole', err);
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Usuarios</h2>
      </div>

      <div className="bg-white rounded shadow">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-3">Nombre</th>
              <th className="p-3">Email</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{u.nombre || u.name}</td>
                <td className="p-3">{u.correo_electronico || u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">
                  <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)}>
                    <option value="USER">USER</option>
                    <option value="COOK">COOK</option>
                    <option value="DISPATCHER">DISPATCHER</option>
                    <option value="ADMIN">ADMIN</option>
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
