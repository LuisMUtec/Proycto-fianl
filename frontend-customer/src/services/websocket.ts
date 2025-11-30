/**
 * Servicio de WebSocket - Notificaciones en tiempo real
 * Conexión automática con manejo de reconexión
 */

import API_ENDPOINTS from '../config/api-endpoints';

export type NotificationType =
  | 'ORDER_STATUS_UPDATE'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_LOCATION_UPDATE'
  | 'ORDER_DELIVERED'
  | 'ORDER_READY'
  | 'ORDER_CANCELLED';

export interface WebSocketNotification {
  type: NotificationType;
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
      console.log('🔌 WebSocket ya está conectado o conectándose');
      return;
    }

    this.token = token;
    this.isConnecting = true;

    try {
      // Construir URL con token
      // Usar encodeURIComponent para manejar caracteres especiales en el JWT
      const wsUrl = `${API_ENDPOINTS.WEBSOCKET}?token=${encodeURIComponent(token)}`;
      console.log('🔌 Conectando a WebSocket...');
      console.log('🔌 URL base:', API_ENDPOINTS.WEBSOCKET);
      console.log('🔌 Token length:', token.length);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket conectado exitosamente');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Notificar a los handlers que estamos conectados
        this.handlers.forEach(handler => {
          try {
            handler({ type: 'ORDER_STATUS_UPDATE', message: 'Conectado a notificaciones en tiempo real' });
          } catch (e) {}
        });
      };

      this.ws.onmessage = (event) => {
        try {
          console.log('📨 WebSocket mensaje raw:', event.data);
          const notification = JSON.parse(event.data) as WebSocketNotification;
          console.log('📨 Notificación parseada:', notification);

          // Notificar a todos los handlers
          this.handlers.forEach(handler => {
            try {
              handler(notification);
            } catch (error) {
              console.error('Error en handler de notificación:', error);
            }
          });
        } catch (error) {
          console.error('Error parseando notificación:', error, 'Raw:', event.data);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.isConnecting = false;
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket cerrado. Code:', event.code, 'Reason:', event.reason);
        this.isConnecting = false;
        this.ws = null;

        // Intentar reconectar si no se superó el máximo
        if (this.reconnectAttempts < this.maxReconnectAttempts && this.token) {
          this.reconnectAttempts++;
          const delay = this.reconnectDelay * this.reconnectAttempts;
          console.log(`🔄 Reintentando conexión en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          setTimeout(() => {
            if (this.token) {
              this.connect(this.token);
            }
          }, delay);
        } else {
          console.log('❌ Se alcanzó el máximo de reconexiones o no hay token');
        }
      };
    } catch (error) {
      console.error('❌ Error creando WebSocket:', error);
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
}

// Instancia singleton
const webSocketService = new WebSocketService();

export default webSocketService;
