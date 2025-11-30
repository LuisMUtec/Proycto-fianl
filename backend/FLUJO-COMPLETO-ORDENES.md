# 🚀 FLUJO COMPLETO DE ÓRDENES - FRIDAYS PERÚ

## 📋 Resumen del Flujo

```
CREATED → COOKING → READY → DELIVERING → DELIVERED
   ↓         ↓        ↓         ↓           ↓
Cliente  Cocinero  Empaq.  Repartidor  Repartidor
```

---

## 🎯 PASO 1: CLIENTE CREA ORDEN (CHECKOUT)

### Endpoint
```bash
POST https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/orders
```

### Token Cliente
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwOTIxMmFmYi0xM2E4LTQyZWQtYWNhYS0xOTczNTA2OTAwM2EiLCJlbWFpbCI6ImNsaWVudGUwMDVAdGVzdC5jb20iLCJyb2xlIjoiQ2xpZW50ZSIsInRlbmFudF9pZCI6bnVsbCwiaWF0IjoxNzY0NDM0OTUzLCJleHAiOjE3NjQ1MjEzNTN9.3IqMdZMyXUramtqnWdRR2DKBcivtUv25kOH6_4AYBQc
```

### Request Body
```json
{
  "tenant_id": "TENANT#003",
  "deliveryAddress": {
    "street": "Av. Larco 1234",
    "city": "Lima",
    "district": "Miraflores",
    "zipCode": "15074"
  },
  "paymentMethod": "CARD",
  "notes": "Extra queso"
}
```

### Comando curl
```bash
# 1. Crear carrito
aws dynamodb put-item --table-name Carts-dev --item '{
  "userId": {"S": "09212afb-13a8-42ed-acaa-19735069003a"},
  "items": {"L": [
    {"M": {
      "productId": {"S": "PRODUCT#647725BB"},
      "name": {"S": "Hamburguesa Clásica"},
      "price": {"N": "35.90"},
      "quantity": {"N": "2"},
      "subtotal": {"N": "71.80"}
    }}
  ]},
  "total": {"N": "71.80"},
  "itemCount": {"N": "2"},
  "createdAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}
}'

# 2. Hacer checkout
curl -X POST "https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/orders" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwOTIxMmFmYi0xM2E4LTQyZWQtYWNhYS0xOTczNTA2OTAwM2EiLCJlbWFpbCI6ImNsaWVudGUwMDVAdGVzdC5jb20iLCJyb2xlIjoiQ2xpZW50ZSIsInRlbmFudF9pZCI6bnVsbCwiaWF0IjoxNzY0NDM0OTUzLCJleHAiOjE3NjQ1MjEzNTN9.3IqMdZMyXUramtqnWdRR2DKBcivtUv25kOH6_4AYBQc" \
  -H "Content-Type: application/json" \
  -d '{"tenant_id":"TENANT#003","deliveryAddress":{"street":"Av. Larco 1234","city":"Lima","district":"Miraflores","zipCode":"15074"},"paymentMethod":"CARD","notes":"Extra queso"}' | jq .
```

### ✅ Qué Revisar en AWS Console

#### 1️⃣ DynamoDB > Orders-dev
- **Buscar**: El `orderId` retornado (ej: `ORDER#c46647ca-796e-4cc5-9c17-8a88f26ca845`)
- **Verificar**:
  - `status` = `"CREATED"`
  - `paymentStatus` = `"COMPLETED"`
  - `paymentDetails.transactionId` = `"TXN#XXXXXXXX"`
  - `total` = precio del carrito + 5.00 (delivery fee)
  - `customerInfo` contiene datos del cliente
  - `tenant_id` = `"TENANT#003"`

#### 2️⃣ Step Functions > FridaysOrderWorkflow-dev
- Click en **"Executions"**
- Buscar ejecución más reciente con estado `SUCCEEDED`
- Click en la ejecución para ver el flujo visual
- Verificar que `NotifyOrderCreated` se ejecutó correctamente

#### 3️⃣ EventBridge > fridays-event-bus-dev
- En la pestaña **"Events"** (si está habilitado el Event Archive)
- Buscar evento con:
  - `Source`: `"fridays.orders"`
  - `DetailType`: `"OrderCreated"`

#### 4️⃣ CloudWatch > Log groups
- `/aws/lambda/fridays-ecommerce-service-dev-createOrder`
  - Buscar: `"💳 Simulando pago"`
  - Buscar: `"✅ Pago exitoso"`
  - Buscar: `"🔄 Step Function iniciada"`
  - Buscar: `"🗑️ Carrito vaciado"`

---

## 🍳 PASO 2: COCINERO CAMBIA A "COOKING"

### Endpoint
```bash
PUT https://9gxi9k52k6.execute-api.us-east-1.amazonaws.com/dev/kitchen/orders/{orderId}/status
```

### Token Cocinero
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjYjM4NmRjMy1jZjkzLTQ0ZTEtYTI5YS00MDBhYTQzYmQxZTAiLCJlbWFpbCI6ImNvY2luZXJvMzAxQGZyaWRheXMucGUiLCJyb2xlIjoiQ29jaW5lcm8iLCJ0ZW5hbnRfaWQiOiJURU5BTlQjMDAzIiwiaWF0IjoxNzY0NDM4MDMzLCJleHAiOjE3NjQ1MjQ0MzN9.c008ii5X4zmukpLAlFWvDbqIQqEYezM3kUkr3UkyLDU
```

### Request Body
```json
{
  "status": "COOKING",
  "notes": "Preparando hamburguesas"
}
```

### Comando curl
```bash
# Reemplaza {ORDER_ID} con el orderId del paso 1
curl -X PUT "https://9gxi9k52k6.execute-api.us-east-1.amazonaws.com/dev/kitchen/orders/ORDER%23{ORDER_ID}/status" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjYjM4NmRjMy1jZjkzLTQ0ZTEtYTI5YS00MDBhYTQzYmQxZTAiLCJlbWFpbCI6ImNvY2luZXJvMzAxQGZyaWRheXMucGUiLCJyb2xlIjoiQ29jaW5lcm8iLCJ0ZW5hbnRfaWQiOiJURU5BTlQjMDAzIiwiaWF0IjoxNzY0NDM4MDMzLCJleHAiOjE3NjQ1MjQ0MzN9.c008ii5X4zmukpLAlFWvDbqIQqEYezM3kUkr3UkyLDU" \
  -H "Content-Type: application/json" \
  -d '{"status":"COOKING","notes":"Preparando hamburguesas"}' | jq .
```

### ✅ Qué Revisar en AWS Console

#### 1️⃣ DynamoDB > Orders-dev
- **Buscar**: El mismo `orderId`
- **Verificar**:
  - `status` cambió de `"CREATED"` → `"COOKING"` ✅
  - `updatedAt` tiene nuevo timestamp
  - `updatedBy` = userId del cocinero
  - **`updatedByInfo`** = objeto con:
    - `userId`: ID del cocinero
    - `email`: "cocinero301@fridays.pe"
    - `role`: "Cocinero"
    - `timestamp`: fecha/hora del cambio
  - **`assignedTo`** = objeto con:
    - `userId`: ID del cocinero
    - `email`: "cocinero301@fridays.pe"
    - `role`: "Cocinero"
    - `name`: "cocinero301"
    - `assignedAt`: fecha/hora de asignación
  - `kitchenNotes` = "Preparando hamburguesas"

#### 2️⃣ EventBridge > fridays-event-bus-dev
- Buscar evento con:
  - `Source`: `"fridays.kitchen"`
  - `DetailType`: `"OrderStatusChanged"`
  - `Detail` contiene: `previousStatus: "CREATED"`, `newStatus: "COOKING"`

#### 3️⃣ CloudWatch > Log groups
- `/aws/lambda/fridays-kitchen-service-dev-putOrderStatus`
  - Buscar: `"🍳 Actualizando orden {orderId} → COOKING por Cocinero"`
  - Buscar: `"✅ Orden {orderId} actualizada a COOKING"`
  - Buscar: `"📡 Evento emitido a EventBridge"`

- `/aws/lambda/fridays-websocket-service-dev-handleOrderStatusChange`
  - Buscar: `"📡 EventBridge event received"`
  - Buscar: `"🔔 Order {orderId}: CREATED → COOKING"`
  - Buscar: `"📤 Enviando a {connectionId}"` (por cada conexión WebSocket activa)
  - Buscar: `"✅ Notificaciones enviadas"`

#### 4️⃣ WebSocket Connections (si hay clientes conectados)
- DynamoDB > WSConnections-dev
- Verificar que existen conexiones activas con:
  - `userId` = cliente que hizo la orden
  - `tenant_id` = "TENANT#003" (staff de la sede)

---

## ✅ PASO 3: COCINERO CAMBIA A "READY"

### Endpoint
```bash
PUT https://9gxi9k52k6.execute-api.us-east-1.amazonaws.com/dev/kitchen/orders/{orderId}/status
```

### Request Body
```json
{
  "status": "READY",
  "notes": "Orden lista para recoger"
}
```

### Comando curl
```bash
curl -X PUT "https://9gxi9k52k6.execute-api.us-east-1.amazonaws.com/dev/kitchen/orders/ORDER%23{ORDER_ID}/status" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjYjM4NmRjMy1jZjkzLTQ0ZTEtYTI5YS00MDBhYTQzYmQxZTAiLCJlbWFpbCI6ImNvY2luZXJvMzAxQGZyaWRheXMucGUiLCJyb2xlIjoiQ29jaW5lcm8iLCJ0ZW5hbnRfaWQiOiJURU5BTlQjMDAzIiwiaWF0IjoxNzY0NDM4MDMzLCJleHAiOjE3NjQ1MjQ0MzN9.c008ii5X4zmukpLAlFWvDbqIQqEYezM3kUkr3UkyLDU" \
  -H "Content-Type: application/json" \
  -d '{"status":"READY","notes":"Orden lista para recoger"}' | jq .
```

### ✅ Qué Revisar
- `status` cambió de `"COOKING"` → `"READY"` ✅
- `updatedByInfo` actualizado con datos del cocinero/empacador
- EventBridge emitió evento `COOKING → READY`
- WebSocket envió notificaciones

---

## 🚚 PASO 4: REPARTIDOR CAMBIA A "DELIVERING"

### Endpoint
```bash
PUT https://y8b94sjrcc.execute-api.us-east-1.amazonaws.com/dev/delivery/orders/{orderId}/status
```

### Token Repartidor (necesitas crear uno)
```bash
# Crear usuario repartidor para TENANT#003
curl -X POST "https://6gce47hxc2.execute-api.us-east-1.amazonaws.com/dev/users" \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "repartidor301@fridays.pe",
    "password": "Pass123!",
    "firstName": "Carlos",
    "lastName": "Delivery",
    "role": "Repartidor",
    "phoneNumber": "+51999888777",
    "tenant_id": "TENANT#003"
  }'

# Login para obtener token
curl -X POST "https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "repartidor301@fridays.pe",
    "password": "Pass123!"
  }'
```

### Request Body
```json
{
  "status": "DELIVERING",
  "location": {
    "lat": -12.1234,
    "lng": -77.5678
  },
  "notes": "En camino al cliente"
}
```

### ✅ Qué Revisar
- `status` cambió de `"READY"` → `"DELIVERING"` ✅
- **`assignedDriver`** = objeto con datos del repartidor:
  - `userId`, `email`, `role`, `name`, `assignedAt`
- `driverLocation` = coordenadas GPS
- `updatedByInfo` contiene datos del repartidor
- EventBridge emitió evento con `driverInfo`

---

## 🎉 PASO 5: REPARTIDOR CAMBIA A "DELIVERED"

### Request Body
```json
{
  "status": "DELIVERED",
  "notes": "Entregado al cliente"
}
```

### ✅ Qué Revisar
- `status` cambió de `"DELIVERING"` → `"DELIVERED"` ✅
- `deliveredAt` tiene timestamp de entrega
- `deliveryNotes` = "Entregado al cliente"
- EventBridge emitió evento final
- WebSocket notificó a cliente y staff

---

## 📊 RESUMEN DE CAMPOS IMPORTANTES EN DYNAMODB

### Campos de Tracking de Responsables

```javascript
{
  "orderId": "ORDER#...",
  "status": "COOKING", // Estado actual
  
  // Última actualización
  "updatedBy": "userId",
  "updatedByInfo": {
    "userId": "...",
    "email": "cocinero301@fridays.pe",
    "role": "Cocinero",
    "timestamp": "2025-11-29T18:00:00Z"
  },
  
  // Cocinero asignado (cuando status = COOKING)
  "assignedTo": {
    "userId": "...",
    "email": "cocinero301@fridays.pe",
    "role": "Cocinero",
    "name": "cocinero301",
    "assignedAt": "2025-11-29T17:45:00Z"
  },
  
  // Repartidor asignado (cuando status = DELIVERING)
  "assignedDriver": {
    "userId": "...",
    "email": "repartidor301@fridays.pe",
    "role": "Repartidor",
    "name": "repartidor301",
    "assignedAt": "2025-11-29T18:15:00Z"
  },
  
  // Ubicación del repartidor (opcional)
  "driverLocation": {
    "lat": -12.1234,
    "lng": -77.5678
  },
  
  // Notas de cocina
  "kitchenNotes": "Preparando hamburguesas",
  
  // Notas de entrega
  "deliveryNotes": "Entregado al cliente",
  
  // Timestamp de entrega
  "deliveredAt": "2025-11-29T18:30:00Z"
}
```

---

## 🔔 NOTIFICACIONES WEBSOCKET

### Estructura del Mensaje para Clientes
```json
{
  "type": "ORDER_STATUS_UPDATE",
  "data": {
    "orderId": "ORDER#...",
    "previousStatus": "CREATED",
    "newStatus": "COOKING",
    "timestamp": "2025-11-29T18:00:00Z",
    "message": "🍳 Tu pedido está siendo preparado por nuestro chef.",
    "driverLocation": null,
    "updatedBy": {
      "role": "Cocinero",
      "email": "cocinero301@fridays.pe"
    }
  }
}
```

### Estructura del Mensaje para Staff
```json
{
  "type": "ORDER_STATUS_UPDATE",
  "data": {
    "orderId": "ORDER#...",
    "previousStatus": "CREATED",
    "newStatus": "COOKING",
    "tenant_id": "TENANT#003",
    "customerInfo": { ... },
    "updatedBy": {
      "userId": "...",
      "email": "cocinero301@fridays.pe",
      "role": "Cocinero"
    },
    "timestamp": "2025-11-29T18:00:00Z",
    "message": "🍳 Orden en preparación",
    "handledBy": {
      "stage": "Cocina",
      "handler": "cocinero301@fridays.pe",
      "role": "Cocinero"
    }
  }
}
```

---

## 🎯 ENDPOINTS COMPLETOS

### E-Commerce Service (Cliente)
- `POST /orders` - Crear orden (checkout con pago simulado)
- `GET /orders` - Listar órdenes del cliente
- `GET /orders/{orderId}` - Ver detalle de orden
- `PUT /orders/{orderId}/cancel` - Cancelar orden

### Kitchen Service (Cocinero/Chef)
- `GET /kitchen/orders/created` - Listar órdenes CREATED
- `PUT /kitchen/orders/{orderId}/status` - Cambiar estado (CREATED → COOKING → READY)

### Delivery Service (Repartidor)
- `GET /delivery/drivers/available` - Listar repartidores disponibles
- `PUT /delivery/orders/{orderId}/status` - Cambiar estado (READY → DELIVERING → DELIVERED)
- `GET /delivery/orders/{orderId}/tracking` - Tracking en tiempo real

### WebSocket Service
- `wss://9bymcj94u7.execute-api.us-east-1.amazonaws.com/dev` - Conectar WebSocket
- Eventos automáticos: `ORDER_STATUS_UPDATE`

---

## 🔍 DEBUGGING

### Ver logs de un Lambda específico
```bash
aws logs tail /aws/lambda/{FUNCTION_NAME} --since 5m --follow
```

### Ver eventos de EventBridge (si tienes Event Archive habilitado)
```bash
aws events list-archives
aws events describe-archive --archive-name {ARCHIVE_NAME}
```

### Ver ejecuciones de Step Functions
```bash
aws stepfunctions list-executions \
  --state-machine-arn arn:aws:states:us-east-1:085179068256:stateMachine:FridaysOrderWorkflow-dev \
  --max-results 10
```

### Verificar conexiones WebSocket activas
```bash
aws dynamodb scan --table-name WSConnections-dev --projection-expression "connectionId,userId,tenant_id,#r" --expression-attribute-names '{"#r":"role"}'
```
