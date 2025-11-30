/**
 * Hook personalizado para manejar notificaciones WebSocket
 * Se conecta automáticamente cuando el usuario inicia sesión
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import webSocketService, { WebSocketNotification } from '../services/websocket';

interface UseWebSocketOptions {
  onMessage?: (notification: WebSocketNotification) => void;
  autoConnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { user, profile } = useAuth();
  const [lastNotification, setLastNotification] = useState<WebSocketNotification | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { onMessage, autoConnect = true } = options;
  const connectionAttempted = useRef(false);

  // Verificar estado de conexión periódicamente
  useEffect(() => {
    const checkConnection = () => {
      const connected = webSocketService.isConnected();
      setIsConnected(connected);
    };

    // Verificar inmediatamente y cada 2 segundos
    checkConnection();
    const interval = setInterval(checkConnection, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Registrar handler para notificaciones
  useEffect(() => {
    const unsubscribe = webSocketService.onNotification((notification) => {
      console.log('🔔 useWebSocket recibió notificación:', notification);
      setLastNotification(notification);
      onMessage?.(notification);
    });

    return () => {
      unsubscribe();
    };
  }, [onMessage]);

  // Conectar automáticamente cuando hay usuario logueado
  useEffect(() => {
    if (autoConnect && user && profile && !connectionAttempted.current) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        console.log('🔌 useWebSocket: Intentando conectar WebSocket...');
        connectionAttempted.current = true;
        
        // Pequeño delay para asegurar que el componente esté montado
        setTimeout(() => {
          if (!webSocketService.isConnected()) {
            webSocketService.connect(token);
          }
        }, 500);
      }
    }
  }, [autoConnect, user, profile]);

  // Reset connection attempt when user changes
  useEffect(() => {
    if (!user) {
      connectionAttempted.current = false;
    }
  }, [user]);

  const connect = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      console.log('🔌 useWebSocket: Conexión manual solicitada');
      webSocketService.connect(token);
    } else {
      console.warn('🔌 useWebSocket: No hay token para conectar');
    }
  }, []);

  const disconnect = useCallback(() => {
    webSocketService.disconnect();
  }, []);

  const sendMessage = useCallback((data: any) => {
    webSocketService.send(data);
  }, []);

  return {
    isConnected,
    lastMessage: lastNotification,
    lastNotification,
    connect,
    disconnect,
    sendMessage,
  };
}

export default useWebSocket;
