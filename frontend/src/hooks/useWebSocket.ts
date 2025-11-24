import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface WebSocketMessage {
  type: 'ORDER_CREATED' | 'ORDER_STATUS_CHANGED';
  orderId: string;
  status: string;
  message: string;
  timestamp: string;
  data?: any;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  autoConnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { user, profile } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const { onMessage, onError, onOpen, onClose, autoConnect = true } = options;

  const connect = useCallback(() => {
    if (!user || !profile) {
      console.log('❌ No user logged in, skipping WebSocket connection');
      return;
    }

    const WS_URL = import.meta.env.VITE_API_URL_WS ;
    const TENANT_ID = import.meta.env.VITE_DEFAULT_TENANT_ID || 'sede-quito-001';

    // Construir URL con query params
    const userId = profile.id;
    const role = (profile.role || 'USER').toString().toUpperCase();
    const tenantId = role === 'USER' ? '' : TENANT_ID;

    const wsUrl = `${WS_URL}?userId=${userId}&role=${role}${tenantId ? `&tenantId=${tenantId}` : ''}`;

    console.log('🔌 Connecting to WebSocket:', wsUrl);
    console.log('🔑 WebSocket params:', { userId, role, tenantId });

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📬 WebSocket message received:', message);
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
        onError?.(error);
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;
        onClose?.();

        // Auto-reconnect after 5 seconds
        if (autoConnect) {
          console.log('🔄 Reconnecting in 5 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }, [user, profile, onMessage, onError, onOpen, onClose, autoConnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      console.log('🔌 Manually disconnecting WebSocket');
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      console.log('📤 Sent message:', message);
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message');
    }
  }, []);

  // Auto-connect when user logs in
  useEffect(() => {
    if (autoConnect && user && profile) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, user, profile, connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
  };
}
