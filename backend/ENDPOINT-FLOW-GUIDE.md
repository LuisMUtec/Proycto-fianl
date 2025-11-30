# 🚀 Flujo Completo de Endpoints - Fridays Perú

## 📋 **Guía de Testing: Del Registro al Delivery**

Esta guía te muestra el flujo completo de uso de la aplicación, paso a paso.

---

## 🎯 **Flujo Principal: Cliente Realiza una Orden**

### **Fase 1: Autenticación** 🔐

#### **1.1 Registrar Usuario (Cliente)**

```bash
POST https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/auth/register

Headers:
Content-Type: application/json

Body:
{
  "email": "cliente@test.com",
  "password": "Password123!",
  "name": "Juan Pérez",
  "role": "Cliente"
}

Response:
{
  "userId": "user_abc123",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "cliente@test.com",
  "role": "Cliente"
}
```

✅ **Guarda el `token`** para usar en los siguientes requests.

---

#### **1.2 Login (Si ya tienes cuenta)**

```bash
POST https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/auth/login

Headers:
Content-Type: application/json

Body:
{
  "email": "cliente@test.com",
  "password": "Password123!"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "user_abc123",
  "email": "cliente@test.com",
  "role": "Cliente"
}
```

---

### **Fase 2: Explorar Menú** 🍔

#### **2.1 Ver Menú Completo (No requiere auth)**

```bash
GET https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/menu?page=1&limit=10

Headers:
(ninguno requerido - endpoint público)

Response:
{
  "products": [
    {
      "productId": "prod_001",
      "name": "Hamburguesa Classic",
      "description": "Hamburguesa con carne, lechuga, tomate",
      "price": 25.50,
      "category": "hamburguesas",
      "imageUrl": "https://...",
      "available": true
    },
    {
      "productId": "prod_002",
      "name": "Coca Cola 500ml",
      "description": "Bebida gaseosa",
      "price": 5.00,
      "category": "bebidas",
      "available": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

---

#### **2.2 Filtrar por Categoría**

```bash
GET https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/menu/hamburguesas

Response:
{
  "category": "hamburguesas",
  "products": [
    {
      "productId": "prod_001",
      "name": "Hamburguesa Classic",
      "price": 25.50
    },
    {
      "productId": "prod_003",
      "name": "Hamburguesa BBQ",
      "price": 28.00
    }
  ]
}
```

**Categorías disponibles:**
- `hamburguesas`
- `bebidas`
- `postres`
- `acompañamientos`

---

#### **2.3 Buscar Producto**

```bash
GET https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/menu/search?q=hamburguesa

Response:
{
  "query": "hamburguesa",
  "results": [
    {
      "productId": "prod_001",
      "name": "Hamburguesa Classic",
      "price": 25.50
    }
  ]
}
```

---

#### **2.4 Ver Detalle de Producto**

```bash
GET https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/menu/items/prod_001

Response:
{
  "productId": "prod_001",
  "name": "Hamburguesa Classic",
  "description": "Hamburguesa con carne 100% res, lechuga, tomate, cebolla",
  "price": 25.50,
  "category": "hamburguesas",
  "imageUrl": "https://...",
  "available": true,
  "ingredients": ["carne", "lechuga", "tomate", "pan"],
  "nutritionalInfo": {
    "calories": 650,
    "protein": 30
  }
}
```

---

### **Fase 3: Crear Orden** 📦

#### **3.1 Crear Orden Directamente (Checkout)**

```bash
POST https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/orders

Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

Body:
{
  "items": [
    {
      "productId": "prod_001",
      "quantity": 2,
      "price": 25.50
    },
    {
      "productId": "prod_002",
      "quantity": 1,
      "price": 5.00
    }
  ],
  "deliveryAddress": "Av. Siempre Viva 123, San Isidro, Lima",
  "paymentMethod": "simulation"
}

Response:
{
  "orderId": "ord_xyz789",
  "userId": "user_abc123",
  "items": [...],
  "total": 56.00,
  "deliveryAddress": "Av. Siempre Viva 123, San Isidro, Lima",
  "status": "PENDING_PAYMENT",
  "createdAt": "2025-11-29T10:30:00Z"
}
```

✅ **Guarda el `orderId`** para pagar.

---

### **Fase 4: Pagar (1-Click Simulado)** 💳

#### **4.1 Confirmar Pago (Solo requiere orderId)**

```bash
POST https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/payments/confirm

Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

Body:
{
  "orderId": "ord_xyz789"
}

Response (95% casos - éxito):
{
  "success": true,
  "paymentStatus": "PAID",
  "transactionId": "txn_sim_abc123",
  "orderId": "ord_xyz789",
  "simulation": true,
  "notice": "✅ Pago procesado instantáneamente (simulación)"
}

Response (5% casos - falla para testing):
{
  "success": false,
  "paymentStatus": "FAILED",
  "orderId": "ord_xyz789",
  "error": "Pago rechazado",
  "simulation": true
}
```

⚡ **¡No necesitas tarjeta de crédito! Es 100% simulado.**

---

### **Fase 5: Seguimiento de Orden** 📍

#### **5.1 Ver Mi Orden**

```bash
GET https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/orders/ord_xyz789

Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response:
{
  "orderId": "ord_xyz789",
  "userId": "user_abc123",
  "items": [...],
  "total": 56.00,
  "status": "PAID",
  "deliveryAddress": "Av. Siempre Viva 123, San Isidro, Lima",
  "createdAt": "2025-11-29T10:30:00Z",
  "paidAt": "2025-11-29T10:31:00Z"
}
```

**Estados de la orden:**
- `PENDING_PAYMENT` → Esperando pago
- `PAID` → Pagado, enviado a cocina
- `PREPARING` → En preparación (cocina)
- `READY` → Listo para recoger
- `IN_TRANSIT` → En camino
- `DELIVERED` → Entregado
- `CANCELLED` → Cancelado

---

#### **5.2 Ver Todas Mis Órdenes**

```bash
GET https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/users/orders

Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response:
{
  "orders": [
    {
      "orderId": "ord_xyz789",
      "total": 56.00,
      "status": "PAID",
      "createdAt": "2025-11-29T10:30:00Z"
    },
    {
      "orderId": "ord_abc456",
      "total": 35.00,
      "status": "DELIVERED",
      "createdAt": "2025-11-28T18:00:00Z"
    }
  ]
}
```

---

## 👨‍🍳 **Flujo: Cocina Procesa la Orden**

### **6.1 Ver Órdenes Pendientes (Staff de Cocina)**

```bash
GET https://9gxi9k52k6.execute-api.us-east-1.amazonaws.com/dev/kitchen/orders

Headers:
Authorization: Bearer <token-staff-cocina>

Response:
{
  "orders": [
    {
      "orderId": "ord_xyz789",
      "items": [...],
      "status": "PAID",
      "createdAt": "2025-11-29T10:31:00Z"
    }
  ]
}
```

---

### **6.2 Asignar Chef a Orden**

```bash
POST https://9gxi9k52k6.execute-api.us-east-1.amazonaws.com/dev/kitchen/orders/ord_xyz789/assign

Headers:
Authorization: Bearer <token-staff-cocina>
Content-Type: application/json

Body:
{
  "chefId": "chef_001"
}

Response:
{
  "orderId": "ord_xyz789",
  "chefId": "chef_001",
  "status": "ASSIGNED"
}
```

---

### **6.3 Actualizar Estado de Orden a "Preparando"**

```bash
PUT https://9gxi9k52k6.execute-api.us-east-1.amazonaws.com/dev/kitchen/orders/ord_xyz789/status

Headers:
Authorization: Bearer <token-staff-cocina>
Content-Type: application/json

Body:
{
  "status": "PREPARING"
}

Response:
{
  "orderId": "ord_xyz789",
  "status": "PREPARING",
  "updatedAt": "2025-11-29T10:35:00Z"
}
```

---

### **6.4 Marcar Orden como "Lista"**

```bash
POST https://9gxi9k52k6.execute-api.us-east-1.amazonaws.com/dev/kitchen/orders/ord_xyz789/ready

Headers:
Authorization: Bearer <token-staff-cocina>

Response:
{
  "orderId": "ord_xyz789",
  "status": "READY",
  "readyAt": "2025-11-29T10:45:00Z"
}
```

---

## 🚗 **Flujo: Delivery Entrega la Orden**

### **7.1 Ver Repartidores Disponibles**

```bash
GET https://y8b94sjrcc.execute-api.us-east-1.amazonaws.com/dev/delivery/drivers/available

Headers:
Authorization: Bearer <token-admin-o-delivery>

Response:
{
  "drivers": [
    {
      "driverId": "driver_001",
      "name": "Carlos Mendoza",
      "vehicleType": "Moto",
      "status": "AVAILABLE",
      "currentLocation": {
        "lat": -12.0464,
        "lng": -77.0428
      }
    }
  ]
}
```

---

### **7.2 Asignar Repartidor a Orden**

```bash
POST https://y8b94sjrcc.execute-api.us-east-1.amazonaws.com/dev/delivery/orders/ord_xyz789/assign

Headers:
Authorization: Bearer <token-admin-o-delivery>
Content-Type: application/json

Body:
{
  "driverId": "driver_001"
}

Response:
{
  "orderId": "ord_xyz789",
  "driverId": "driver_001",
  "status": "ASSIGNED_TO_DRIVER"
}
```

---

### **7.3 Actualizar Estado a "En Tránsito"**

```bash
PUT https://y8b94sjrcc.execute-api.us-east-1.amazonaws.com/dev/delivery/orders/ord_xyz789/status

Headers:
Authorization: Bearer <token-driver>
Content-Type: application/json

Body:
{
  "status": "IN_TRANSIT"
}

Response:
{
  "orderId": "ord_xyz789",
  "status": "IN_TRANSIT",
  "estimatedDelivery": "2025-11-29T11:15:00Z"
}
```

---

### **7.4 Ver Tracking de Orden (Cliente)**

```bash
GET https://y8b94sjrcc.execute-api.us-east-1.amazonaws.com/dev/delivery/orders/ord_xyz789/tracking

Headers:
Authorization: Bearer <token-cliente>

Response:
{
  "orderId": "ord_xyz789",
  "status": "IN_TRANSIT",
  "driver": {
    "name": "Carlos Mendoza",
    "phone": "987654321",
    "vehicleType": "Moto",
    "currentLocation": {
      "lat": -12.0500,
      "lng": -77.0450
    }
  },
  "estimatedDelivery": "2025-11-29T11:15:00Z"
}
```

---

### **7.5 Marcar como Entregado**

```bash
PUT https://y8b94sjrcc.execute-api.us-east-1.amazonaws.com/dev/delivery/orders/ord_xyz789/status

Headers:
Authorization: Bearer <token-driver>
Content-Type: application/json

Body:
{
  "status": "DELIVERED"
}

Response:
{
  "orderId": "ord_xyz789",
  "status": "DELIVERED",
  "deliveredAt": "2025-11-29T11:10:00Z"
}
```

---

## 👨‍💼 **Flujo: Admin ve Dashboard**

### **8.1 Ver Dashboard General**

```bash
GET https://f86cp89s8e.execute-api.us-east-1.amazonaws.com/dev/admin/dashboard/tenant_001

Headers:
Authorization: Bearer <token-admin>

Response:
{
  "tenantId": "tenant_001",
  "today": {
    "orders": 45,
    "revenue": 2550.00,
    "averageOrderValue": 56.67
  },
  "week": {
    "orders": 280,
    "revenue": 15680.00
  },
  "topProducts": [
    {
      "productId": "prod_001",
      "name": "Hamburguesa Classic",
      "orderCount": 120
    }
  ]
}
```

---

### **8.2 Ver Métricas de Cocina**

```bash
GET https://f86cp89s8e.execute-api.us-east-1.amazonaws.com/dev/admin/kitchen/metrics

Headers:
Authorization: Bearer <token-admin>

Response:
{
  "averagePreparationTime": "12 minutos",
  "ordersInProgress": 8,
  "ordersCompleted": 37,
  "efficiency": "92%"
}
```

---

### **8.3 Ver Finanzas Diarias**

```bash
GET https://f86cp89s8e.execute-api.us-east-1.amazonaws.com/dev/admin/finances/daily

Headers:
Authorization: Bearer <token-admin>

Response:
{
  "date": "2025-11-29",
  "totalRevenue": 2550.00,
  "totalOrders": 45,
  "averageOrderValue": 56.67,
  "paymentMethods": {
    "simulation": 2550.00
  }
}
```

---

## 🔌 **Flujo: WebSocket (Notificaciones en Tiempo Real)**

### **9.1 Conectarse al WebSocket**

```javascript
const ws = new WebSocket('wss://9bymcj94u7.execute-api.us-east-1.amazonaws.com/dev?token=YOUR_JWT_TOKEN');

ws.onopen = () => {
  console.log('✅ Conectado a WebSocket');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('📨 Notificación:', data);
  
  // Ejemplo de notificación:
  // {
  //   "type": "ORDER_STATUS_UPDATE",
  //   "orderId": "ord_xyz789",
  //   "status": "PREPARING",
  //   "message": "Tu orden está siendo preparada"
  // }
};
```

---

## 📊 **Resumen del Flujo Completo**

```
1. 🔐 CLIENTE: Register/Login
   ↓
2. 🍔 CLIENTE: Explorar menú
   ↓
3. 📦 CLIENTE: Crear orden
   ↓
4. 💳 CLIENTE: Pagar (1-click)
   ↓
5. 👨‍🍳 COCINA: Ver orden pendiente
   ↓
6. 👨‍🍳 COCINA: Asignar chef
   ↓
7. 👨‍🍳 COCINA: Preparar (status: PREPARING)
   ↓
8. 👨‍🍳 COCINA: Marcar como lista (status: READY)
   ↓
9. 🚗 DELIVERY: Asignar repartidor
   ↓
10. 🚗 DELIVERY: En tránsito (status: IN_TRANSIT)
   ↓
11. 📍 CLIENTE: Ver tracking en tiempo real
   ↓
12. 🚗 DELIVERY: Entregar (status: DELIVERED)
   ↓
13. 👨‍💼 ADMIN: Ver métricas y dashboard
```

---

## 🧪 **Testing Rápido con cURL**

### **Test Completo en 5 minutos:**

```bash
# 1. Register
curl -X POST https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","name":"Test User","role":"Cliente"}'

# Guarda el token que te devuelve
TOKEN="eyJhbGci..."

# 2. Ver menú
curl https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/menu

# 3. Crear orden
curl -X POST https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items":[{"productId":"prod_001","quantity":2,"price":25.50}],
    "deliveryAddress":"Test Address",
    "paymentMethod":"simulation"
  }'

# Guarda el orderId
ORDER_ID="ord_xyz789"

# 4. Pagar (1-click)
curl -X POST https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/payments/confirm \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"orderId\":\"$ORDER_ID\"}"

# 5. Ver orden
curl https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/orders/$ORDER_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 **Checklist de Testing**

- [ ] ✅ Register funciona
- [ ] ✅ Login devuelve token
- [ ] ✅ Ver menú (público)
- [ ] ✅ Crear orden
- [ ] ✅ **Pago 1-click funciona**
- [ ] ✅ Ver mis órdenes
- [ ] ✅ Cocina ve orden pendiente
- [ ] ✅ Cocina cambia estado a PREPARING
- [ ] ✅ Delivery asigna repartidor
- [ ] ✅ Cliente ve tracking
- [ ] ✅ Admin ve dashboard
- [ ] ✅ WebSocket envía notificaciones

---

## 🎯 **Próximos Pasos**

1. ✅ Importa las colecciones de Postman desde `postman/`
2. ✅ Actualiza las URLs con las de `endpoints.txt`
3. ✅ Sigue este flujo en Postman
4. ✅ Conecta tu frontend usando estas APIs

---

**¡Listo para probar! 🚀**

**URLs Base:**
- E-Commerce: `https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev`
- Kitchen: `https://9gxi9k52k6.execute-api.us-east-1.amazonaws.com/dev`
- Delivery: `https://y8b94sjrcc.execute-api.us-east-1.amazonaws.com/dev`
- Admin: `https://f86cp89s8e.execute-api.us-east-1.amazonaws.com/dev`
- WebSocket: `wss://9bymcj94u7.execute-api.us-east-1.amazonaws.com/dev`
