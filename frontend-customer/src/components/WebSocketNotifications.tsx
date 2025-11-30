import { useEffect, useState } from 'react';
import { Bell, CheckCircle, Clock, Package, Truck, ChefHat, X } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';

interface Notification {
  id: string;
  type: string;
  message: string;
  orderId: string;
  status: string;
  timestamp: string;
}

export function WebSocketNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const { isConnected } = useWebSocket({
    onMessage: (message) => {
      // El mensaje ya viene normalizado desde websocket.ts
      // Extraer datos del campo 'data' si existe, o usar campos directos
      const data = message.data || message;

      const notification: Notification = {
        id: `${Date.now()}-${Math.random()}`,
        type: message.type || 'ORDER_STATUS_UPDATE',
        message: data.message || message.message || 'Estado de pedido actualizado',
        orderId: data.orderId || message.orderId || '',
        status: data.newStatus || data.status || message.status || 'UNKNOWN',
        timestamp: data.timestamp || message.timestamp || new Date().toISOString(),
      };

      setNotifications(prev => [notification, ...prev].slice(0, 10)); // Mantener solo las últimas 10

      // Mostrar notificación del navegador si está permitido
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('TGI Fridays', {
          body: message.message,
          icon: '/favicon.ico',
        });
      }
    },
    autoConnect: true,
  });

  // Solicitar permiso de notificaciones
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CREATED':
        return <Bell className="text-blue-500" size={20} />;
      case 'COOKING':
        return <ChefHat className="text-orange-500" size={20} />;
      case 'READY':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'PACKAGED':
        return <Package className="text-purple-500" size={20} />;
      case 'ON_THE_WAY':
        return <Truck className="text-yellow-500" size={20} />;
      case 'DELIVERED':
        return <CheckCircle className="text-green-600" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        title="Notificaciones"
      >
        <Bell size={24} className={isConnected ? 'text-gray-700' : 'text-gray-400'} />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
        {!isConnected && (
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div>
              <h3 className="font-bold text-gray-900">Notificaciones</h3>
              <p className="text-xs text-gray-500 mt-1">
                {isConnected ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Conectado en tiempo real
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Desconectado
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={48} className="mx-auto mb-2 text-gray-300" />
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 hover:bg-gray-50 transition-colors group relative"
                  >
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                    >
                      <X size={14} />
                    </button>

                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getStatusIcon(notification.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          Pedido #{notification.orderId.substring(0, 8)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.timestamp).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setNotifications([])}
                className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Limpiar todas
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
