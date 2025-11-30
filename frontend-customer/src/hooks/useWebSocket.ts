/**
 * Hook personalizado para manejar notificaciones WebSocket
 * Se conecta automáticamente cuando el usuario inicia sesión
 */

import { useEffect, useState, useCallback } from 'react';
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

  // Verificar estado de conexión
  useEffect(() => {
    const checkConnection = () => {
      const connected = webSocketService.isConnected();
      setIsConnected(connected);
    };

    // Verificar cada segundo
    const interval = setInterval(checkConnection, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Registrar handler para notificaciones
  useEffect(() => {
    const unsubscribe = webSocketService.onNotification((notification) => {
      setLastNotification(notification);
      onMessage?.(notification);
    });

    return () => {
      unsubscribe();
    };
  }, [onMessage]);

  // Conectar automáticamente cuando hay usuario
  useEffect(() => {
    if (autoConnect && user && profile) {
      const token = localStorage.getItem('auth_token');
      if (token && !webSocketService.isConnected()) {
        webSocketService.connect(token);
      }
    }
  }, [autoConnect, user, profile]);

  const connect = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      webSocketService.connect(token);
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
    lastMessage: lastNotification, // Alias para compatibilidad
    lastNotification,
    connect,
    disconnect,
    sendMessage,
  };
}

export default useWebSocket;
