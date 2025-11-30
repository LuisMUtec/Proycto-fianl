/**
 * Servicio de pagos - E-Commerce Service
 * Sistema de pago simulado (1-click)
 */

import { ecommerceApi } from '../lib/api-client';

export interface PaymentConfirmRequest {
  orderId: string;
}

export interface PaymentConfirmResponse {
  success: boolean;
  paymentStatus: 'PAID' | 'FAILED';
  transactionId?: string;
  orderId: string;
  amount?: number;
  simulation: boolean;
  notice?: string;
  error?: string;
}

/**
 * POST /payments/confirm - Pagar orden (1-click, simulado)
 * NO requiere datos de tarjeta, solo orderId
 * 95% éxito automático, 5% falla para testing
 */
export async function confirmPayment(orderId: string): Promise<PaymentConfirmResponse> {
  return await ecommerceApi.post<PaymentConfirmResponse>('/payments/confirm', { orderId }, true);
}

/**
 * POST /payments/create-intent - Crear intención de pago (opcional)
 * Este endpoint existe pero no es necesario usarlo en el flujo actual
 */
export async function createPaymentIntent(orderId: string): Promise<any> {
  return await ecommerceApi.post<any>('/payments/create-intent', { orderId }, true);
}

export default {
  confirmPayment,
  createPaymentIntent,
};
