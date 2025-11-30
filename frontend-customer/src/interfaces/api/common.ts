/**
 * Tipados comunes para todas las respuestas de la API
 */

export interface ApiResponse<T = unknown> {
  statusCode: number;
  body: T;
}

export interface PaginationParams {
  page?: number;
  size?: number;
}

export interface PaginationResponse {
  current_page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface FilterParams {
  sede_id?: string;
  term?: string;
  status?: string;
  orderBy?: string;
  order?: 'asc' | 'desc';
}



export type Role = 'Cliente' | 'USUARIO' | 'COCINERO' | 'DESPACHADOR' | 'ADMIN' | 'Cheff Ejecutivo' | 'Cocinero' | 'Empacador' | 'Repartidor' | 'Admin Sede';
