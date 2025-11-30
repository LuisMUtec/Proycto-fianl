/**
 * Servicio de WebSocket - Notificaciones en tiempo real
 * Conexión automática con manejo de reconexión
 *
 * Formato del backend (handleOrderStatusChange.js):
 * {
 *   type: 'ORDER_STATUS_UPDATE',
 *   data: {
 *     orderId, previousStatus, newStatus, timestamp, message,
 *     driverLocation, updatedBy
 *   }
 * }
 */

import API_ENDPOINTS from '../config/api-endpoints';

export type NotificationType =
  | 'ORDER_STATUS_UPDATE'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_LOCATION_UPDATE'
  | 'ORDER_DELIVERED'
  | 'ORDER_READY'
  | 'ORDER_CANCELLED';

// Datos dentro del campo 'data' del mensaje del backend
export interface OrderStatusData {
  orderId: string;
  previousStatus?: string;
  newStatus: string;
  timestamp?: string;
  message?: string;
  driverLocation?: {
    lat: number;
    lng: number;
  } | null;
  updatedBy?: {
    role: string;
    email: string;
  } | null;
}

export interface WebSocketNotification {
  type: NotificationType;
  // El backend envía los datos en 'data'
  data?: OrderStatusData;
  // Campos normalizados para uso en componentes
  orderId?: string;
  status?: string;
  message?: string;
  timestamp?: string;
  driver?: {
    name: string;
    phone: string;
    vehicleType: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  estimatedTime?: string;
}

export type NotificationHandler = (notification: WebSocketNotification) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;
  private handlers: NotificationHandler[] = [];
  private token: string | null = null;
  private isConnecting = false;

  /**
   * Conectar al WebSocket con token de autenticación
   */
  connect(token: string): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      console.log('WebSocket ya está conectado o conectándose');
      return;
    }

    this.token = token;
    this.isConnecting = true;

    try {
      const wsUrl = `${API_ENDPOINTS.WEBSOCKET}?token=${encodeURIComponent(token)}`;
      console.log('Conectando a WebSocket:', wsUrl);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket conectado');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          console.log('📨 Mensaje WebSocket recibido:', raw);

          // Normalizar: el backend envía { type, data: {...} }
          // Extraer datos del campo 'data' para facilitar uso en componentes
          const notification: WebSocketNotification = {
            type: raw.type,
            data: raw.data,
            // Campos normalizados desde 'data'
            orderId: raw.data?.orderId || raw.orderId,
            status: raw.data?.newStatus || raw.data?.status || raw.status,
            message: raw.data?.message || raw.message,
            timestamp: raw.data?.timestamp || raw.timestamp,
            location: raw.data?.driverLocation || raw.location,
          };

          console.log('📨 Notificación normalizada:', notification);

          // Notificar a todos los handlers
          this.handlers.forEach(handler => {
            try {
              handler(notification);
            } catch (error) {
              console.error('Error en handler de notificación:', error);
            }
          });
        } catch (error) {
          console.error('Error parseando notificación:', error, event.data);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ Error WebSocket:', error);
        this.isConnecting = false;
      };

      this.ws.onclose = () => {
        console.log('WebSocket desconectado');
        this.isConnecting = false;
        this.ws = null;

        // Intentar reconectar si no se superó el máximo
        if (this.reconnectAttempts < this.maxReconnectAttempts && this.token) {
          this.reconnectAttempts++;
          const delay = this.reconnectDelay * this.reconnectAttempts;
          console.log(`Reintentando conexión en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          setTimeout(() => {
            if (this.token) {
              this.connect(this.token);
            }
          }, delay);
        }
      };
    } catch (error) {
      console.error('Error creando WebSocket:', error);
      this.isConnecting = false;
    }
  }

  /**
   * Desconectar del WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      console.log('Cerrando conexión WebSocket');
      this.reconnectAttempts = this.maxReconnectAttempts; // Evitar reconexión automática
      this.ws.close();
      this.ws = null;
    }
    this.token = null;
    this.isConnecting = false;
  }

  /**
   * Registrar un handler para notificaciones
   */
  onNotification(handler: NotificationHandler): () => void {
    this.handlers.push(handler);

    // Retornar función para deregistrar
    return () => {
      const index = this.handlers.indexOf(handler);
      if (index > -1) {
        this.handlers.splice(index, 1);
      }
    };
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Enviar mensaje al servidor (si es necesario)
   */
  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket no está conectado');
    }
  }

  /**
   * Simular una notificación local (para cuando el backend no envía eventos)
   * Útil cuando createOrder no dispara evento a EventBridge
   */
  simulateNotification(rawMessage: any): void {
    console.log('📨 Simulando notificación local:', rawMessage);

    // Normalizar el mensaje igual que si viniera del servidor
    const notification: WebSocketNotification = {
      type: rawMessage.type || 'ORDER_STATUS_UPDATE',
      data: rawMessage.data,
      orderId: rawMessage.data?.orderId || rawMessage.orderId,
      status: rawMessage.data?.newStatus || rawMessage.data?.status || rawMessage.status,
      message: rawMessage.data?.message || rawMessage.message,
      timestamp: rawMessage.data?.timestamp || rawMessage.timestamp || new Date().toISOString(),
      location: rawMessage.data?.driverLocation || rawMessage.location,
    };

    // Notificar a todos los handlers
    this.handlers.forEach(handler => {
      try {
        handler(notification);
      } catch (error) {
        console.error('Error en handler de notificación:', error);
      }
    });
  }
}

// Instancia singleton
const webSocketService = new WebSocketService();

export default webSocketService;
