# 🍔 TGI Fridays - API Endpoints por Rol

## 📋 Índice
- [Autenticación](#-autenticación-público)
- [Menú / Productos](#-menú--productos)
- [Órdenes](#-órdenes)
- [WebSocket](#-websocket)
- [Roles y Permisos](#-roles-y-permisos)

---

## 🔐 Autenticación (Público)

### **POST** `/auth/register`
**Rol requerido:** Ninguno (Público)
**Descripción:** Registra un nuevo usuario cliente

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phoneNumber": "+593987654321",
  "address": "Av. Principal 123, Quito"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "user-001",
    "email": "usuario@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "USER"
  }
}
```

⚠️ **Nota:** Este endpoint SIEMPRE crea usuarios con rol `USER`. Los roles administrativos (COOK, DISPATCHER, ADMIN) deben crearse mediante:
- Script de seed: `python backend/scripts/seed-data.py --stage dev`
- Panel de administración
- Directamente en DynamoDB

---

### **POST** `/auth/login`
**Rol requerido:** Ninguno (Público)
**Descripción:** Inicia sesión y obtiene token JWT

**Request Body:**
```json
{
  "email": "cliente@fridays.com",
  "password": "todos123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "user-001",
    "email": "cliente@fridays.com",
    "firstName": "Juan",
    "lastName": "Cliente",
    "role": "USER"
  }
}
```

---

## 🍔 Menú / Productos

### **GET** `/menu`
**Rol requerido:** Ninguno (Público)
**Descripción:** Lista todos los productos del menú con paginación

**Query Params:**
- `limit` (opcional): Número máximo de productos a retornar (default: 20)
- `tenantId` (opcional): Filtrar por sede específica

**Response (200):**
```json
{
  "products": [
    {
      "productId": "prod-001",
      "tenantId": "sede-quito-001",
      "name": "Jack Daniel's Burger",
      "description": "Hamburguesa con salsa Jack Daniel's...",
      "category": "FOOD",
      "price": 12.99,
      "preparationTime": 15,
      "available": true,
      "imageUrl": "https://example.com/burger.jpg",
      "ingredients": ["Carne de res", "Pan brioche", "..."]
    }
  ],
  "count": 10
}
```

---

### **GET** `/menu/{category}`
**Rol requerido:** Ninguno (Público)
**Descripción:** Lista productos filtrados por categoría

**Path Params:**
- `category`: `FOOD` | `DRINK` | `DESSERT` | `COMBO`

**Response (200):**
```json
{
  "products": [...],
  "count": 5,
  "category": "FOOD"
}
```

---

### **POST** `/menu/productos`
**Rol requerido:** `ADMIN` 👔
**Descripción:** Crea un nuevo producto en el menú

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Hamburguesa Clásica",
  "description": "Hamburguesa con queso, lechuga y tomate",
  "category": "FOOD",
  "price": 18.5,
  "currency": "USD",
  "isAvailable": true,
  "preparationTimeMinutes": 15,
  "imageUrl": "https://example.com/burger.jpg",
  "tags": ["burger", "carne", "queso"]
}
```

**Response (201):**
```json
{
  "message": "Producto creado exitosamente",
  "product": {
    "productId": "prod-011",
    "name": "Hamburguesa Clásica",
    ...
  }
}
```

---

### **PUT** `/menu/items/{itemId}`
**Rol requerido:** `ADMIN` 👔
**Descripción:** Actualiza un producto existente

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Hamburguesa Clásica Premium",
  "price": 22.5,
  "description": "Versión premium con queso cheddar"
}
```

**Response (200):**
```json
{
  "message": "Producto actualizado exitosamente",
  "product": {...}
}
```

---

### **PUT** `/menu/items/{itemId}/availability`
**Rol requerido:** `ADMIN` 👔
**Descripción:** Activa o desactiva la disponibilidad de un producto

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "isAvailable": false
}
```

**Response (200):**
```json
{
  "message": "Disponibilidad actualizada",
  "productId": "prod-001",
  "available": false
}
```

---

## 📦 Órdenes

### **POST** `/orders`
**Rol requerido:** `USER` 👤
**Descripción:** Crea una nueva orden usando Step Functions

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": "prod-001",
      "quantity": 2,
      "notes": "Sin cebolla"
    },
    {
      "productId": "prod-005",
      "quantity": 1
    }
  ],
  "notes": "Para llevar. Incluir cubiertos",
  "paymentMethod": "CARD",
  "deliveryAddress": "Av. Amazonas N21-147, Quito"
}
```

**Response (200):**
```json
{
  "orderId": "order-abc-123",
  "status": "CREATED",
  "total": 33.48,
  "items": [
    {
      "productId": "prod-001",
      "name": "Jack Daniel's Burger",
      "quantity": 2,
      "unitPrice": 12.99,
      "subtotal": 25.98
    },
    {
      "productId": "prod-005",
      "name": "Margarita Clásica",
      "quantity": 1,
      "unitPrice": 7.50,
      "subtotal": 7.50
    }
  ],
  "userId": "user-001",
  "tenantId": "sede-quito-001",
  "createdAt": "2025-11-22T10:30:00Z"
}
```

**Flujo interno:**
1. **PrepareOrderData** - Valida y enriquece items con info de productos
2. **PersistAndBuildOrder** - Guarda orden en DynamoDB
3. **PublishOrderCreatedEvent** - Publica evento `ORDER_CREATED` en EventBridge
4. **WebSocket broadcast** - Notifica a usuarios conectados

---

### **PUT** `/orders/{tenantId}/{orderId}/status`
**Rol requerido:** `COOK` 👨‍🍳, `DISPATCHER` 🚗, `ADMIN` 👔
**Descripción:** Actualiza el estado de una orden

**Headers:**
```
Authorization: Bearer <token>
```

**Path Params:**
- `tenantId`: ID de la sede (ej: `sede-quito-001`)
- `orderId`: ID de la orden

**Request Body:**
```json
{
  "status": "COOKING",
  "notes": "Asignado a estación de parrilla"
}
```

**Estados válidos por rol:**

| Estado | COOK 👨‍🍳 | DISPATCHER 🚗 | ADMIN 👔 |
|--------|:---------:|:-------------:|:--------:|
| `CREATED` | ✅ | ✅ | ✅ |
| `COOKING` | ✅ | ❌ | ✅ |
| `READY` | ✅ | ❌ | ✅ |
| `PACKAGED` | ❌ | ✅ | ✅ |
| `ON_THE_WAY` | ❌ | ✅ | ✅ |
| `DELIVERED` | ❌ | ✅ | ✅ |
| `CANCELLED` | ✅ | ✅ | ✅ |

**Response (200):**
```json
{
  "message": "Estado actualizado exitosamente",
  "orderId": "order-abc-123",
  "tenantId": "sede-quito-001",
  "previousStatus": "CREATED",
  "newStatus": "COOKING",
  "updatedBy": "cook-001",
  "updatedAt": "2025-11-22T10:35:00Z"
}
```

**Flujo interno:**
1. Actualiza el estado en DynamoDB
2. Publica evento `ORDER_STATUS_CHANGED` en EventBridge
3. El evento dispara la Lambda broadcast
4. Notifica a usuarios conectados vía WebSocket

---

### **GET** `/orders/{tenantId}` ⚠️ NO IMPLEMENTADO
**Rol requerido:** `COOK` 👨‍🍳, `DISPATCHER` 🚗, `ADMIN` 👔
**Descripción:** Lista todas las órdenes de un tenant

> ⚠️ **PENDIENTE DE IMPLEMENTACIÓN**
> Este endpoint es necesario para los dashboards de Kitchen y Delivery.

**Respuesta esperada:**
```json
{
  "orders": [
    {
      "orderId": "order-abc-123",
      "status": "COOKING",
      "total": 33.48,
      "items": [...],
      "createdAt": "2025-11-22T10:30:00Z"
    }
  ]
}
```

---

## 🌐 WebSocket

### **WebSocket Connect**
**URL:** `wss://{apiId}.execute-api.{region}.amazonaws.com/{stage}`
**Descripción:** Conecta al WebSocket para recibir notificaciones en tiempo real

**Query Params:**
- `userId`: ID del usuario
- `tenantId`: ID de la sede (para staff)
- `role`: Rol del usuario (`USER`, `COOK`, `DISPATCHER`, `ADMIN`)

**Ejemplo de conexión (JavaScript):**
```javascript
const userId = 'user-001'; // Del JWT
const tenantId = 'sede-quito-001';
const role = 'USER';

const ws = new WebSocket(
  `wss://i1gzzaf7nf.execute-api.us-east-1.amazonaws.com/dev?userId=${userId}&tenantId=${tenantId}&role=${role}`
);

ws.onopen = () => console.log('✅ Conectado');

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('📬 Nueva notificación:', notification);
};

ws.onerror = (error) => console.error('❌ Error:', error);
ws.onclose = () => console.log('🔌 Desconectado');
```

---

### **Mensajes WebSocket**

#### `ORDER_CREATED`
Enviado cuando se crea una nueva orden

```json
{
  "type": "ORDER_CREATED",
  "orderId": "order-abc-123",
  "status": "CREATED",
  "message": "✅ Tu pedido ha sido confirmado",
  "timestamp": "2025-11-22T10:30:00Z",
  "data": {
    "orderId": "order-abc-123",
    "tenantId": "sede-quito-001",
    "status": "CREATED",
    "total": 55.5,
    "items": [...]
  }
}
```

**Destinatarios:**
- El usuario que creó la orden (`USER`)
- Todo el staff de la sede (`COOK`, `DISPATCHER`, `ADMIN`)

---

#### `ORDER_STATUS_CHANGED`
Enviado cuando cambia el estado de una orden

```json
{
  "type": "ORDER_STATUS_CHANGED",
  "orderId": "order-abc-123",
  "status": "COOKING",
  "message": "👨‍🍳 Tu pedido está en preparación",
  "timestamp": "2025-11-22T10:35:00Z",
  "data": {
    "orderId": "order-abc-123",
    "tenantId": "sede-quito-001",
    "status": "COOKING",
    "previousStatus": "CREATED",
    "changedBy": "cook-001",
    "total": 55.5,
    "items": [...]
  }
}
```

**Mensajes según estado:**
- `CREATED`: ✅ Tu pedido ha sido confirmado
- `COOKING`: 👨‍🍳 Tu pedido está en preparación
- `READY`: 🔔 Tu pedido está listo
- `PACKAGED`: 📦 Tu pedido está siendo empaquetado
- `ON_THE_WAY`: 🚗 Tu pedido está en camino
- `DELIVERED`: 🎉 ¡Pedido entregado! ¡Disfruta!
- `CANCELLED`: ❌ Tu pedido ha sido cancelado

**Destinatarios:**
- El usuario que creó la orden (`USER`)
- Todo el staff de la sede (`COOK`, `DISPATCHER`, `ADMIN`)

---

## 👥 Roles y Permisos

### **USER** 👤 - Cliente
**Permisos:**
- ✅ Registrarse (`POST /auth/register`)
- ✅ Iniciar sesión (`POST /auth/login`)
- ✅ Ver menú (`GET /menu`)
- ✅ Crear órdenes (`POST /orders`)
- ✅ Recibir notificaciones WebSocket de sus pedidos

**Características:**
- NO tiene `tenantId`
- Puede ordenar de cualquier sede
- Solo recibe notificaciones de sus propias órdenes

---

### **COOK** 👨‍🍳 - Chef/Cocinero
**Permisos:**
- ✅ Iniciar sesión (`POST /auth/login`)
- ✅ Ver menú (`GET /menu`)
- ✅ Actualizar órdenes a: `COOKING`, `READY` (`PUT /orders/{tenantId}/{orderId}/status`)
- ✅ Recibir notificaciones WebSocket de todas las órdenes de su sede

**Características:**
- Tiene `tenantId` (asociado a una sede)
- Solo puede operar órdenes de su sede
- Recibe notificaciones de TODAS las órdenes de su sede

---

### **DISPATCHER** 🚗 - Repartidor
**Permisos:**
- ✅ Iniciar sesión (`POST /auth/login`)
- ✅ Ver menú (`GET /menu`)
- ✅ Actualizar órdenes a: `PACKAGED`, `ON_THE_WAY`, `DELIVERED` (`PUT /orders/{tenantId}/{orderId}/status`)
- ✅ Recibir notificaciones WebSocket de órdenes listas

**Características:**
- Tiene `tenantId` (asociado a una sede)
- Solo puede operar órdenes de su sede
- Campos adicionales: `vehicleType`, `licensePlate`

---

### **ADMIN** 👔 - Administrador
**Permisos:**
- ✅ Todos los permisos de `COOK` y `DISPATCHER`
- ✅ Crear productos (`POST /menu/productos`)
- ✅ Actualizar productos (`PUT /menu/items/{itemId}`)
- ✅ Cambiar disponibilidad (`PUT /menu/items/{itemId}/availability`)
- ✅ Actualizar órdenes a cualquier estado
- ✅ Recibir notificaciones WebSocket de todas las órdenes

**Características:**
- Tiene `tenantId` (asociado a una sede)
- Control total sobre menú y órdenes de su sede

---

## 🔑 Usuarios Pre-configurados

Creados por el script `backend/scripts/seed-data.py --stage dev`

| Rol | Email | Password | Nombre | TenantId |
|-----|-------|----------|--------|----------|
| **USER** 👤 | `cliente@fridays.com` | `todos123` | Juan Cliente | - |
| **COOK** 👨‍🍳 | `chef@fridays.com` | `todos123` | María Chef | `sede-quito-001` |
| **COOK** 👨‍🍳 | `chef2@fridays.com` | `todos123` | Pedro Cocinero | `sede-quito-001` |
| **DISPATCHER** 🚗 | `delivery@fridays.com` | `todos123` | Carlos Delivery | `sede-quito-001` |
| **ADMIN** 👔 | `admin@fridays.com` | `todos123` | Ana Admin | `sede-quito-001` |

---

## 📝 Productos Pre-configurados

Creados por el script de seed (10 productos):

| ID | Nombre | Categoría | Precio | Tiempo Prep |
|----|--------|-----------|--------|-------------|
| `prod-001` | Jack Daniel's Burger | FOOD | $12.99 | 15 min |
| `prod-002` | Costillas BBQ | FOOD | $18.50 | 25 min |
| `prod-003` | Alitas Picantes | FOOD | $10.99 | 12 min |
| `prod-004` | Caesar Salad | FOOD | $9.99 | 8 min |
| `prod-005` | Margarita Clásica | DRINK | $7.50 | 3 min |
| `prod-006` | Limonada Natural | DRINK | $3.50 | 2 min |
| `prod-007` | Cerveza Corona | DRINK | $4.00 | 1 min |
| `prod-008` | Brownie con Helado | DESSERT | $6.99 | 5 min |
| `prod-009` | Cheesecake de Fresa | DESSERT | $5.99 | 3 min |
| `prod-010` | Combo Familiar | COMBO | $39.99 | 20 min |

---

## 🚀 URLs de Despliegue

**API Base URL:**
`https://k6jm5wvb0h.execute-api.us-east-1.amazonaws.com/dev`

**WebSocket URL:**
`wss://i1gzzaf7nf.execute-api.us-east-1.amazonaws.com/dev`

**Default TenantId:**
`sede-quito-001`

---

## 📚 Recursos Adicionales

- **Colección Postman:** `backend/postman_collection.json`
- **Script de Seed:** `backend/scripts/seed-data.py`
- **Serverless Config:** `backend/serverless.yml`

---

## ⚠️ Endpoints Faltantes (Por Implementar)

### Para Dashboards:
- `GET /orders/{tenantId}` - Listar todas las órdenes de una sede
- `GET /orders/{tenantId}?status={status}` - Filtrar órdenes por estado
- `GET /orders/{tenantId}/{orderId}` - Obtener detalles de una orden específica

### Para Estadísticas:
- `GET /stats/{tenantId}/summary` - Resumen de ventas y órdenes
- `GET /stats/{tenantId}/revenue` - Ingresos por período

---

**Última actualización:** 22 de Noviembre, 2025
**Versión del Backend:** 1.0.0
