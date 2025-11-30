/**
 * Configuración centralizada de endpoints del backend
 * Actualizar estas URLs después de cada despliegue
 */

const isDevelopment = import.meta.env.MODE === 'development';
const useLocal = import.meta.env.VITE_USE_LOCAL_API === 'true';

export const API_ENDPOINTS = {
  // E-Commerce Service (Auth, Menu, Orders, Cart, Payments)
  ECOMMERCE: useLocal && isDevelopment
    ? import.meta.env.VITE_API_ECOMMERCE_LOCAL
    : import.meta.env.VITE_API_ECOMMERCE || 'https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev',

  // Delivery Service (Tracking)
  DELIVERY: useLocal && isDevelopment
    ? import.meta.env.VITE_API_DELIVERY_LOCAL
    : import.meta.env.VITE_API_DELIVERY || 'https://y8b94sjrcc.execute-api.us-east-1.amazonaws.com/dev',

  // WebSocket Service (Notificaciones en tiempo real)
  WEBSOCKET: useLocal && isDevelopment
    ? import.meta.env.VITE_WS_URL_LOCAL
    : import.meta.env.VITE_WS_URL || 'wss://9bymcj94u7.execute-api.us-east-1.amazonaws.com/dev',
} as const;

// Validar que las URLs estén configuradas
Object.entries(API_ENDPOINTS).forEach(([key, value]) => {
  if (!value) {
    console.warn(`⚠️ Falta configurar ${key} en .env`);
  }
});

export default API_ENDPOINTS;
