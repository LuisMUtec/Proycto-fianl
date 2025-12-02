# Documentación de Arquitectura - Sistema de Órdenes en Tiempo Real

## 📋 Descripción General

Este documento explica cómo funciona la arquitectura serverless para el sistema de gestión de órdenes con notificaciones en tiempo real, basado en AWS Lambda, API Gateway, DynamoDB y EventBridge.

---

## 🏗️ Componentes Principales

### 1. **API Gateway HTTP**
- Endpoints REST para comandos (crear órdenes, cambiar estado)
- El frontend (Operador) usa estos endpoints para enviar comandos

### 2. **API Gateway WebSocket**
- Canal de comunicación bidireccional para notificaciones en tiempo real
- El frontend (Usuario) se conecta para recibir actualizaciones del estado de su pedido

### 3. **AWS Step Functions - OrderWorkflow**
- Orquesta la creación de órdenes en 3 pasos secuenciales
- Garantiza consistencia y manejo de errores

### 4. **EventBridge**
- Bus de eventos que desacopla productores de consumidores
- Permite comunicación asíncrona entre servicios

### 5. **DynamoDB**
- **Orders**: Estado persistente de las órdenes
- **WSConnections**: Conexiones WebSocket activas por usuario
- **Products**: Catálogo de productos
- **Users**: Información de usuarios

---

## 🔄 Flujo 1: Creación de Orden (OrderWorkflow)

### Paso a Paso

```
Cliente (SPA) 
  ↓ POST /orders
API Gateway HTTP
  ↓ dispara
Step Functions (OrderWorkflow)
  ↓
  ├─ 1. PrepareOrderData (Lambda)
  │    ├─ Valida datos de entrada
  │    ├─ Consulta productos en DynamoDB
  │    ├─ Valida disponibilidad
  │    └─ Calcula totales
  │
  ├─ 2. PersistAndBuildOrder (Lambda)
  │    ├─ Genera orderId único
  │    ├─ Guarda orden en DynamoDB Orders
  │    └─ Retorna orden creada
  │
  └─ 3. PublishOrderCreatedEvent (Lambda)
       ├─ Publica evento ORDER_CREATED
       └─ EventBridge → regla filtra evento → orderEventsToWS
```

### Request de Ejemplo

```bash
POST https://{api-id}.execute-api.us-east-1.amazonaws.com/dev/orders

Body:
{
  "requestId": "uuid-del-frontend",
  "tenantId": "TENANT#001",
  "userId": "UUID-USER-123",
  "items": [
    {
      "productId": "PRODUCT#001",
      "quantity": 2
    },
    {
      "productId": "PRODUCT#003",
      "quantity": 1
    }
  ],
  "notes": "Sin cebolla, por favor",
  "paymentMethod": "CASH"
}
```

### Response de Ejemplo

```json
{
  "orderId": "uuid-generado",
  "tenantId": "TENANT#001",
  "userId": "UUID-USER-123",
  "status": "CREATED",
  "items": [
    {
      "productId": "PRODUCT#001",
      "name": "Hamburguesa Clásica",
      "quantity": 2,
      "unitPrice": 18.5,
      "subtotal": 37.0
    }
  ],
  "total": 55.5,
  "createdAt": "2025-11-22T10:30:00Z",
  "eventPublished": true
}
```

---

## 🔄 Flujo 2: Actualización de Estado (updateStatus → EventBridge → broadcast)

### Paso a Paso

```
Operador (Cocinero/Despachador)
  ↓ PUT /orders/{tenantId}/{orderId}/status
API Gateway HTTP
  ↓
updateStatus (Lambda)
  ├─ 1. Obtiene orden de DynamoDB Orders
  ├─ 2. Valida permisos (tenantId)
  ├─ 3. Actualiza estado y timeline en DynamoDB
  ├─ 4. Publica evento ORDER_STATUS_CHANGED en EventBridge
  └─ 5. Retorna respuesta HTTP al operador

EventBridge
  ├─ Escucha evento ORDER_STATUS_CHANGED
  ├─ Regla filtra por detail-type
  └─ Dispara Lambda orderEventsToWS (broadcast)

orderEventsToWS (Lambda - broadcast)
  ├─ 1. Extrae datos del evento
  ├─ 2. Construye mensaje para cliente
  ├─ 3. Consulta WSConnections en DynamoDB
  │     ├─ Busca por userId (dueño de la orden)
  │     └─ Busca por tenantId + role (staff: COOK, DISPATCHER, ADMIN)
  ├─ 4. Envía mensaje a cada conexión activa
  │     └─ Usa API Gateway Management API (@connections)
  └─ 5. Elimina conexiones obsoletas (GoneException)

Usuario/Staff (WebSocket conectado)
  └─ Recibe notificación en tiempo real
```

### Request de Ejemplo (updateStatus)

```bash
PUT https://{api-id}.execute-api.us-east-1.amazonaws.com/dev/orders/TENANT#001/uuid-orden/status

Body:
{
  "status": "COOKING",
  "userId": "UUID-COCINERO-456",
  "notes": "Asignado a estación de parrilla"
}
```

### Response de Ejemplo

```json
{
  "message": "Estado actualizado exitosamente",
  "orderId": "uuid-orden",
  "previousStatus": "CREATED",
  "newStatus": "COOKING",
  "updatedAt": "2025-11-22T10:35:00Z"
}
```

### Mensaje WebSocket Recibido por el Cliente

```json
{
  "type": "ORDER_STATUS_CHANGED",
  "orderId": "uuid-orden",
  "status": "COOKING",
  "message": "👨‍🍳 Tu pedido está en preparación",
  "timestamp": "2025-11-22T10:35:00Z",
  "data": {
    "orderId": "uuid-orden",
    "tenantId": "TENANT#001",
    "status": "COOKING",
    "previousStatus": "CREATED",
    "total": 55.5,
    "items": [...]
  }
}
```

---

## 🔌 Flujo 3: Conexión y Notificaciones WebSocket

### Conexión WebSocket

```
Usuario (Cliente SPA)
  ↓ WebSocket Connect
  ↓ wss://{ws-api-id}.execute-api.us-east-1.amazonaws.com/dev
  ↓ Query params: ?userId=UUID&tenantId=TENANT#001&role=USER
API Gateway WebSocket
  ↓ dispara $connect
onConnect (Lambda)
  ├─ Extrae connectionId, userId, tenantId, role
  ├─ Guarda en DynamoDB WSConnections
  │   {
  │     "connectionId": "abc123==",
  │     "userId": "UUID-USER-123",
  │     "tenantId": "TENANT#001",
  │     "role": "USER",
  │     "connectedAt": "2025-11-22T10:30:00Z",
  │     "ttl": 1732368000  // 24 horas
  │   }
  └─ Retorna 200 OK
```

### Desconexión WebSocket

```
Usuario cierra la aplicación o pierde conexión
  ↓ WebSocket Disconnect
API Gateway WebSocket
  ↓ dispara $disconnect
onDisconnect (Lambda)
  ├─ Extrae connectionId
  ├─ Elimina de DynamoDB WSConnections
  └─ Retorna 200 OK
```

### Broadcast de Notificaciones

```
EventBridge publica evento (ORDER_CREATED o ORDER_STATUS_CHANGED)
  ↓
orderEventsToWS (broadcast Lambda)
  ├─ Consulta WSConnections en DynamoDB
  │   ├─ Query por userId-index (dueño de la orden)
  │   └─ Query por tenantId-index + filtro role in [COOK, DISPATCHER, ADMIN]
  │
  ├─ Para cada conexión activa:
  │   ├─ POST to @connections API
  │   ├─ Envía mensaje JSON serializado
  │   └─ Si GoneException → elimina conexión obsoleta
  │
  └─ Retorna resumen: {sentCount: 5, failedCount: 1}
```

---

## 📊 Tablas DynamoDB

### Orders
```
PK: orderId (String)
Atributos:
- tenantId, userId, status, items[], total, createdAt, updatedAt
- timeline: { CREATED: timestamp, COOKING: timestamp, ... }
- cookId, dispatcherId, resolvedAt

GSI:
- tenantId-status-index
- tenantId-createdAt-index
```

### WSConnections
```
PK: connectionId (String)
Atributos:
- userId, tenantId, role, connectedAt, ttl

GSI:
- userId-index (para buscar conexiones de un usuario)
- tenantId-index (para buscar conexiones de un tenant/staff)
```

---

## 🎯 Cómo el Frontend Consume los Endpoints

### Frontend Usuario (Cliente)

#### 1. Crear Orden
```javascript
// POST /orders
const response = await fetch(API_ENDPOINT + '/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    requestId: crypto.randomUUID(),
    tenantId: 'TENANT#001',
    userId: currentUser.userId,
    items: cartItems,
    notes: orderNotes,
    paymentMethod: 'CASH'
  })
});

const order = await response.json();
console.log('Orden creada:', order.orderId);
```

#### 2. Conectar a WebSocket
```javascript
// Conectar al WebSocket para recibir notificaciones
const ws = new WebSocket(
  `${WS_ENDPOINT}?userId=${userId}&tenantId=${tenantId}&role=USER`
);

ws.onopen = () => {
  console.log('Conectado a notificaciones en tiempo real');
};

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('Nueva notificación:', notification);
  
  // Actualizar UI con el nuevo estado
  if (notification.type === 'ORDER_STATUS_CHANGED') {
    updateOrderStatus(notification.orderId, notification.status);
    showToast(notification.message); // "👨‍🍳 Tu pedido está en preparación"
  }
};

ws.onerror = (error) => {
  console.error('Error WebSocket:', error);
};

ws.onclose = () => {
  console.log('Desconectado de notificaciones');
  // Reconectar automáticamente si es necesario
};
```

### Frontend Operador (Cocinero/Despachador)

#### 1. Actualizar Estado de Orden
```javascript
// PUT /orders/{tenantId}/{orderId}/status
const updateOrderStatus = async (orderId, newStatus) => {
  const response = await fetch(
    `${API_ENDPOINT}/orders/${tenantId}/${orderId}/status`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        userId: currentUser.userId, // ID del cocinero/despachador
        notes: 'Procesando orden'
      })
    }
  );
  
  const result = await response.json();
  console.log('Estado actualizado:', result);
};

// Ejemplo: Cocinero marca orden como "COOKING"
await updateOrderStatus('uuid-orden', 'COOKING');
```

#### 2. Conectar a WebSocket (Staff)
```javascript
// El staff también se conecta para recibir nuevas órdenes
const ws = new WebSocket(
  `${WS_ENDPOINT}?userId=${userId}&tenantId=${tenantId}&role=COOK`
);

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  
  // Nueva orden creada → mostrar en dashboard de cocina
  if (notification.type === 'ORDER_CREATED') {
    addOrderToKitchenQueue(notification.data);
    playNotificationSound();
  }
  
  // Estado actualizado → actualizar vista
  if (notification.type === 'ORDER_STATUS_CHANGED') {
    updateOrderInDashboard(notification.orderId, notification.status);
  }
};
```

---

## 🔐 Seguridad y Consideraciones

### AWS Academy - LabRole
- Todas las Lambdas usan `arn:aws:iam::${aws:accountId}:role/LabRole`
- No se crean roles personalizados (restricción de AWS Academy)
- LabRole tiene permisos preconfigurados para DynamoDB, EventBridge, API Gateway, etc.

### JWT Secret
- Almacenado en AWS Systems Manager Parameter Store
- Referenciado en `serverless.yml`: `${ssm:/fridays/jwt-secret~true}`

### Validaciones
- **PrepareOrderData**: Valida productos, disponibilidad, tenant
- **updateStatus**: Valida tenantId, orderId, estado válido
- **onConnect**: Requiere userId y tenantId en query params

---

## 📝 Estados de Orden

```
CREATED → COOKING → READY → PACKAGED → ON_THE_WAY → DELIVERED
              ↓
          CANCELLED
```

### Estados y Responsables

| Estado | Responsable | Descripción |
|--------|-------------|-------------|
| CREATED | Sistema | Orden confirmada |
| COOKING | Chef/Cocinero | En preparación |
| READY | Cocinero | Listo para empaquetar |
| PACKAGED | Empacador | Empaquetado |
| ON_THE_WAY | Repartidor | En camino al cliente |
| DELIVERED | Repartidor | Entregado |
| CANCELLED | Admin/Usuario | Cancelado |

---

## 🚀 Despliegue

### Prerrequisitos
```bash
npm install -g serverless
cd backend
npm install
```

### Deploy
```bash
serverless deploy --stage dev --region us-east-1
```

### Outputs
```
POST - https://xxx.execute-api.us-east-1.amazonaws.com/dev/orders
PUT - https://xxx.execute-api.us-east-1.amazonaws.com/dev/orders/{tenantId}/{orderId}/status
WebSocket - wss://yyy.execute-api.us-east-1.amazonaws.com/dev
```

---

## 🧪 Pruebas con Postman

Ver archivo: `postman_collection.json` para la colección completa de pruebas.

**Flujo de prueba sugerido:**

1. **Crear Orden** → `POST /orders`
2. **Conectar WebSocket** → Usuario y Staff
3. **Actualizar Estado** → `PUT /orders/{tenantId}/{orderId}/status`
   - COOKING
   - READY
   - PACKAGED
   - ON_THE_WAY
   - DELIVERED
4. **Verificar Notificaciones** → En WebSocket del Usuario

---

## 📞 Resumen de Conexiones

```
┌─────────────────┐
│   Frontend      │
│   (Usuario)     │
└────────┬────────┘
         │
         ├─ POST /orders ──────────────► Step Functions (OrderWorkflow)
         │                                  ├─ PrepareOrderData
         │                                  ├─ PersistAndBuildOrder (→ DynamoDB)
         │                                  └─ PublishOrderCreatedEvent (→ EventBridge)
         │
         └─ WebSocket Connect ────────────► onConnect (→ DynamoDB WSConnections)
                  │
                  └─ Recibe mensajes ◄──── orderEventsToWS (broadcast)
                                              ▲
                                              │
                                          EventBridge
                                              ▲
                                              │
┌─────────────────┐                          │
│   Frontend      │                          │
│   (Operador)    │                          │
└────────┬────────┘                          │
         │                                   │
         └─ PUT /orders/{id}/status ────────┼─► updateStatus
                                             │     ├─ Update DynamoDB Orders
                                             │     └─ Publish ORDER_STATUS_CHANGED
                                             │
                                             └──────────────┘
```

---

## ✅ Ventajas de Esta Arquitectura

1. **Desacoplamiento**: EventBridge desacopla `updateStatus` de `orderEventsToWS`
2. **Escalabilidad**: Lambdas escalan automáticamente
3. **Notificaciones en Tiempo Real**: WebSocket permite comunicación bidireccional
4. **Trazabilidad**: Timeline en cada orden registra todos los cambios
5. **Manejo de Errores**: Step Functions con reintentos y estados de fallo
6. **Multi-tenant**: Aislamiento por `tenantId`
7. **Auditabilidad**: Logs detallados en CloudWatch

---

## 🔧 Troubleshooting

### WebSocket no recibe mensajes
- Verificar que la conexión esté registrada en `WSConnections`
- Verificar que el `WEBSOCKET_ENDPOINT` en `orderEventsToWS` sea correcto
- Revisar CloudWatch Logs de `orderEventsToWS`

### Orden no se crea
- Verificar que productos existan en DynamoDB `Products`
- Verificar que usuario exista en DynamoDB `Users`
- Revisar CloudWatch Logs de Step Functions

### Estado no se actualiza
- Verificar que `orderId` y `tenantId` sean correctos
- Verificar que el estado sea válido
- Revisar CloudWatch Logs de `updateStatus`

---

**Autor**: Sistema de Gestión de Órdenes - Fridays Perú  
**Fecha**: Noviembre 2025  
**Versión**: 1.0
