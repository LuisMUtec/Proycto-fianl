import { useState, useEffect } from 'react';
import { Package, Clock, ChefHat, Box, Truck, CheckCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as ordersService from '../services/orders';

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal?: number;
}

interface Order {
  orderId: string;
  userId: string;
  tenant_id?: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: any;
  customerInfo?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
  };
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: string;
  updatedAt?: string;
}

export function OrderTrackingPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar órdenes del usuario
  const loadOrders = async () => {
    if (!profile) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await ordersService.getUserOrders();
      console.log('📦 Órdenes cargadas:', response);

      // La respuesta puede ser { orders: [...] } o directamente un array
      const ordersList = Array.isArray(response) ? response : (response.orders || []);
      setOrders(ordersList);
    } catch (err: any) {
      console.error('Error cargando órdenes:', err);
      setError(err?.message || 'Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [profile]);

  const getStatusInfo = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CREATED':
        return {
          icon: Clock,
          text: 'Creado',
          color: 'text-blue-600',
          bg: 'bg-blue-100',
        };
      case 'COOKING':
        return {
          icon: ChefHat,
          text: 'En Cocina',
          color: 'text-orange-600',
          bg: 'bg-orange-100',
        };
      case 'PACKING':
        return {
          icon: Box,
          text: 'Empaquetando',
          color: 'text-purple-600',
          bg: 'bg-purple-100',
        };
      case 'READY':
        return {
          icon: Package,
          text: 'Listo',
          color: 'text-green-600',
          bg: 'bg-green-100',
        };
      case 'DELIVERING':
        return {
          icon: Truck,
          text: 'En Camino',
          color: 'text-blue-600',
          bg: 'bg-blue-100',
        };
      case 'DELIVERED':
        return {
          icon: CheckCircle,
          text: 'Entregado',
          color: 'text-green-600',
          bg: 'bg-green-100',
        };
      case 'CANCELLED':
        return {
          icon: Package,
          text: 'Cancelado',
          color: 'text-red-600',
          bg: 'bg-red-100',
        };
      default:
        return {
          icon: Package,
          text: status || 'Desconocido',
          color: 'text-gray-600',
          bg: 'bg-gray-100',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Mis Pedidos</h1>
          <p className="text-xl text-gray-300">
            Seguimiento en tiempo real de tus pedidos
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Botón de actualizar */}
        <div className="flex justify-end mb-4">
          <button
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package size={80} className="mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No tienes pedidos
            </h2>
            <p className="text-gray-600">
              Realiza tu primer pedido desde el menú
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              const customerName = order.customerInfo
                ? `${order.customerInfo.firstName || ''} ${order.customerInfo.lastName || ''}`.trim()
                : 'Cliente';
              const customerPhone = order.customerInfo?.phoneNumber || '-';

              // La dirección puede ser string o objeto
              const addressText = typeof order.deliveryAddress === 'string'
                ? order.deliveryAddress
                : (order.deliveryAddress?.street || order.deliveryAddress?.reference || '');

              // Obtener nombre de la sede
              const getTenantName = (tenantId?: string) => {
                switch (tenantId) {
                  case 'TENANT#001': return 'TGI Fridays Miraflores';
                  case 'TENANT#002': return 'TGI Fridays San Isidro';
                  case 'TENANT#003': return 'TGI Fridays La Molina';
                  default: return tenantId || 'Sede no especificada';
                }
              };

              return (
                <div
                  key={order.orderId}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Pedido #{order.orderId.replace('ORDER#', '').substring(0, 8)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleString('es-PE', {
                            dateStyle: 'long',
                            timeStyle: 'short',
                          })}
                        </p>
                      </div>
                      <div
                        className={`flex items-center space-x-2 px-4 py-2 rounded-full ${statusInfo.bg}`}
                      >
                        <StatusIcon size={20} className={statusInfo.color} />
                        <span className={`font-semibold ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                    </div>

                    {/* Sede */}
                    <div className="mb-4 p-3 bg-red-50 rounded-lg">
                      <span className="text-red-600 text-sm font-medium">📍 Sede:</span>
                      <p className="font-semibold text-red-700">{getTenantName(order.tenant_id)}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Cliente:</span>
                        <p className="font-medium">{customerName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Teléfono:</span>
                        <p className="font-medium">{customerPhone}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Pago:</span>
                        <p className="font-medium capitalize">{order.paymentMethod || 'Tarjeta'}</p>
                      </div>
                    </div>

                    {/* Dirección de entrega */}
                    {addressText && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600 text-sm">🏠 Dirección de entrega:</span>
                        <p className="font-medium">{addressText}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Items del Pedido
                    </h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div
                          key={item.productId || index}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-medium text-gray-900">
                            S/ {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t mt-4 pt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Subtotal</span>
                        <span>S/ {order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Delivery</span>
                        <span>S/ {order.deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="font-bold text-gray-900">
                          S/ {order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
