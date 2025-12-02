/*
  Admin service: mapea los endpoints que el frontend necesitará del backend.

  Endpoints sugeridos (AWS Lambda / API Gateway):
  - GET  /admin/dashboard                -> estadísticas (orders, revenue, active, customers, recentOrders)
  - GET  /admin/products                 -> lista de productos (paginado)
  - GET  /admin/products/:id             -> obtener producto
  - POST /admin/products                 -> crear producto
  - PUT  /admin/products/:id             -> actualizar producto
  - DELETE /admin/products/:id          -> eliminar producto
  - GET  /admin/orders                   -> listar órdenes (filtros: status, date)
  - PUT  /admin/orders/:id               -> actualizar estado de orden (p.ej. preparar, listo, enviado)
  - GET  /admin/users                    -> listar usuarios

  Ajusta las rutas/headers conforme a tu infra (Authorizer, JWT, etc.).
*/

// Construye headers de autorización a partir del token guardado en localStorage
function getAuthHeaders(): HeadersInit | undefined {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

// Prefer explicit base vars; fall back to older names if needed
const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL_COMIDA || import.meta.env.VITE_API_URL || '';

async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.status === 204 ? null : res.json();
}

export async function fetchDashboard() {
  const res = await fetch(`${API_BASE}/admin/dashboard`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function listProducts(page = 1, perPage = 20) {
  const res = await fetch(`${API_BASE}/admin/products?page=${page}&per_page=${perPage}`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function getProduct(id: string) {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export type CreateProductPayload = {
  name: string;
  description?: string;
  category?: string;
  price: number;
  currency?: string;
  preparationTimeMinutes?: number;
  isAvailable?: boolean;
  tags?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
};

export type CreatedProductResult = {
  product: any;
  s3UploadUrl?: string;
  message?: string;
};

export async function createProduct(payload: CreateProductPayload): Promise<CreatedProductResult> {
  const res = await fetch(`${API_BASE}/admin/products`, {
    method: 'POST',
    headers: { ...(getAuthHeaders() ?? {}), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await handleResponse(res);

  // Response shape expected:
  // { success: true, message: 'Success', data: { product: {...}, message: '...', s3UploadUrl: '...' } }
  if (json && typeof json === 'object') {
    const data = json.data ?? json;
    return {
      product: data.product ?? data.product,
      s3UploadUrl: data.s3UploadUrl ?? data.s3_upload_url ?? undefined,
      message: data.message ?? json.message ?? undefined,
    } as CreatedProductResult;
  }

  return { product: json } as CreatedProductResult;
}

export async function updateProduct(id: string, payload: any) {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'PUT',
    headers: { ...(getAuthHeaders() ?? {}), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteProduct(id: string) {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function listOrders(query = '') {
  const res = await fetch(`${API_BASE}/admin/orders${query ? `?${query}` : ''}`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function updateOrderStatus(id: string, payload: any) {
  const res = await fetch(`${API_BASE}/admin/orders/${id}`, {
    method: 'PUT',
    headers: { ...(getAuthHeaders() ?? {}), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function listUsers(page = 1, perPage = 50) {
  const res = await fetch(`${API_BASE}/admin/users?page=${page}&per_page=${perPage}`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function updateUserRole(id: string, role: string) {
  const res = await fetch(`${API_BASE}/admin/users/${id}/role`, {
    method: 'PUT',
    headers: { ...(getAuthHeaders() ?? {}), 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  return handleResponse(res);
}

export default {
  fetchDashboard,
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listOrders,
  updateOrderStatus,
  listUsers,
};
