/**
 * Servicio de tracking - Delivery Service
 * Seguimiento de órdenes en tiempo real
 */

import { deliveryApi } from '../lib/api-client';

export interface DriverInfo {
  driverId: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehiclePlate?: string;
  rating?: number;
  photo?: string;
  currentLocation?: {
    lat: number;
    lng: number;
    accuracy?: number;
    timestamp?: string;
  };
}

export interface RouteInfo {
  origin: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  distance?: string;
  estimatedTime?: string;
}

export interface TrackingTimeline {
  status: string;
  timestamp: string;
  message: string;
}

export interface TrackingResponse {
  orderId: string;
  status: string;
  driver?: DriverInfo;
  route?: RouteInfo;
  estimatedDelivery?: string;
  message?: string;
  estimatedPreparation?: string;
  timeline?: TrackingTimeline[];
}

/**
 * GET /delivery/orders/{orderId}/tracking - Obtener tracking de orden
 */
export async function getOrderTracking(orderId: string): Promise<TrackingResponse> {
  return await deliveryApi.get<TrackingResponse>(`/delivery/orders/${orderId}/tracking`, true);
}

export default {
  getOrderTracking,
};
