/**
 * Servicio de órdenes - E-Commerce Service
 * Maneja la creación, consulta y gestión de órdenes
 */

import { ecommerceApi } from '../lib/api-client';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal?: number;
}

export interface Order {
  orderId: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  deliveryInstructions?: string;
  contactPhone?: string;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
  paidAt?: string;
  updatedAt?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    message?: string;
  }>;
}

export type OrderStatus =
  | 'CREATED'      // Recién creada, pendiente de pago
  | 'PAID'         // Pagada, enviada a cocina
  | 'PREPARING'    // En preparación
  | 'READY'        // Lista para recoger/entregar
  | 'IN_TRANSIT'   // En camino
  | 'DELIVERED'    // Entregada
  | 'CANCELLED';   // Cancelada

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface CreateOrderRequest {
  tenant_id: string;
  deliveryAddress: string | {
    street: string;
    district?: string;
    reference?: string;
  };
  paymentMethod?: string;
  notes?: string;
  // Items del carrito local (fallback si el sync del carrito falla)
  items?: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface CreateOrderResponse {
  order: {
    orderId: string;
    userId: string;
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    deliveryAddress: any;
    status: OrderStatus;
    createdAt: string;
  };
  payment: {
    status: string;
    transactionId: string;
    amount: number;
    currency: string;
  };
}

export interface OrderListResponse {
  orders: Order[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface CancelOrderResponse {
  orderId: string;
  status: 'CANCELLED';
  cancelledAt: string;
  reason: string;
}

// Tenant ID por defecto (debe coincidir con el tenant_id de los productos)
const DEFAULT_TENANT_ID = 'TENANT#001';

/**
 * POST /orders - Crear nueva orden (requiere autenticación)
 * El backend espera: tenant_id, deliveryAddress, paymentMethod, notes
 * También enviamos items como respaldo por si el carrito del server no está sincronizado
 */
export async function createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
  const requestBody: any = {
    tenant_id: data.tenant_id || DEFAULT_TENANT_ID,
    deliveryAddress: data.deliveryAddress,
    paymentMethod: data.paymentMethod || 'CARD',
    notes: data.notes,
  };

  // Incluir items si están disponibles (respaldo para cuando cart sync falla)
  if (data.items && data.items.length > 0) {
    requestBody.items = data.items;
  }

  return await ecommerceApi.post<CreateOrderResponse>('/orders', requestBody, true);
}

/**
 * GET /orders/{orderId} - Ver detalle de orden (requiere autenticación)
 */
export async function getOrder(orderId: string): Promise<Order> {
  return await ecommerceApi.get<Order>(`/orders/${orderId}`, true);
}

/**
 * GET /users/orders - Historial de órdenes del usuario (requiere autenticación)
 */
export async function getUserOrders(page = 1, limit = 10): Promise<OrderListResponse> {
  return await ecommerceApi.get<OrderListResponse>(`/users/orders?page=${page}&limit=${limit}`, true);
}

/**
 * PUT /orders/{orderId}/cancel - Cancelar orden (requiere autenticación)
 * Solo se puede cancelar si está en estado CREATED, PAID o PREPARING
 */
export async function cancelOrder(orderId: string, reason?: string): Promise<CancelOrderResponse> {
  return await ecommerceApi.put<CancelOrderResponse>(`/orders/${orderId}/cancel`, {
    reason: reason || 'Cancelado por el cliente',
  }, true);
}

export default {
  createOrder,
  getOrder,
  getUserOrders,
  cancelOrder,
};
