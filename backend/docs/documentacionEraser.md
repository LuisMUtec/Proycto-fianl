 Inpiration : Fridays Perú



# 🍔 Sistema de Gestión de Pedidos - Fridays Perú
## 📋 Descripción
Sistema serverless para gestión de pedidos de Fridays Perú con e-commerce, seguimiento en tiempo real y dashboard administrativo.

---

## 🏗️ Arquitectura Serverless
### Microservicios
#### 1. **🛒 E-commerce Service**
**Responsable:** Usuario

**Endpoints:**

http

(paginacion)

```
# Menú y Catálogo
GET /menu                          # Menú completo (listar productos empaginados)
GET /menu/{category}              # Items por categoría

# Usuarios Clientes
POST /auth/register               # Registro cliente
POST /auth/login                  # Login cliente



# Carrito//frontend - local storage

# Pedidos Cliente
POST /orders                      # Crear pedido
GET /orders/{orderId}            # Ver pedido
GET /users/orders                # Historial del cliente
```
#### 2. **👨‍🍳 Kitchen Service**
**Responsable:** Chef ejecutivo

**Endpoints:**

http

```
# Gestión Cocina
POST /kitchen/orders/{orderId}/assign    # Cheff asigna ordenen a un chef (se puede hacer automatico o al azar)
PUT /kitchen/orders/{ordenId}/   # Cocinero actualiza estado
GET /kitchen/orders/created             # Pedidos created (pendientes)
POST /kitchen/orders/{orderId}/ready    # Marcar listo para empaquetar

(generamos chefs con un script para poblar la bd)

```
#### 3. **🚚 Delivery Service**
**Responsable:** Empaquetador

**Endpoints:**

http

```
# Delivery
POST /delivery/orders/{orderId}/assign    # Asignar repartidor (o automatico)
PUT /delivery/orders/{orderId}/status     # Actualizar estado entrega
GET /delivery/drivers/available          # Repartidores disponibles

(se van a generar repartidores de manera automatica)
GET /delivery/drivers                    # Listar repartidores
```
#### 4. **📊 Admin Service**
**Responsable:** Admin

**Endpoints:**

http

```
# Dashboard
GET /admin/dashboard/{tenantId}                    # Métricas principales
GET /admin/orders/today                # Pedidos del día
GET /admin/kitchen/metrics             # Métricas de cocina

# Gestión Sede
GET /admin/sedes                       # Listar sedes
POST /admin/sedes                      # Crear sede
POST /admin/users                      # Crear usuario staff


(se puede scriptear para poblar la bd productos)
# Gestión Menú (Admin) 
POST /menu/productos                       # Agregar productos al menú
PUT /menu/items/{itemId}              # Actualizar item
PUT /menu/items/{itemId}/availability  # Cambiar disponibilidad
```
---

## 🗂️ Estructura de Datos Simple
### t_productos
json

```
{
  "productId": "PRODUCT#001",             // PK en Dynamo

  "tenantId": "TENANT#001",               // a qué sede pertenece

  "name": "Hamburguesa Clásica",
  
  "description": "Hamburguesa con queso, lechuga y tomate",
  
  "category": "FOOD",                     // FOOD | DRINK | DESSERT | COMBO...

  "price": 18.5,
  
  "currency": "PEN",

  "isAvailable": true,
  
  "preparationTimeMinutes": 15,

  "imageKey": "images/tenant-001/burger-001.jpg",
  "imageUrl": "https://mi-bucket.s3.amazonaws.com/images/tenant-001/burger-001.jpg",

  "tags": ["burger", "carne", "combo1"],  // opcional: filtros, búsqueda


  "createdAt": "2025-11-17T15:32:00Z",
  "updatedAt": "2025-11-17T15:32:00Z",
  "createdBy": "USER#ADMIN1",
  "updatedBy": "USER#ADMIN1"
}
```
### OrdersTable
json

```
{
  "orderId": "ord_123",
  "sedeId": "sede_miraflores",
  "customerId": "cus_123",
  "customerInfo": {
    "name": "Ana López",
    "phone": "+51987654321",
    "address": "Av. Principal 123, Miraflores"
  },
  "status": "IN_KITCHEN",
  "orderType": "delivery",
  "items": [
    {
      "itemId": "hamburguesa-clasica",
      "name": "Hamburguesa Clásica",
      "quantity": 1,
      "price": 28.90,
      "station": "parrilla",
      "status": "COOKING"
    }
  ],
  "timestamps": {
    "created": "2025-01-20T10:30:00Z",
    "kitchen_start": "2025-01-20T10:32:00Z"
  }
}
```
### UsersTable
json

```
{
"userId": "UUID",                        // PK de la tabla

"tenantId": "TENANT#001",                // Sede/restaurante al que pertenece
                                         // Para clientes puede ser null o no estar



"role": "USER",                          // USER | DISPATCHER | COOK | ADMIN

"firstName": "Leonardo",

"lastName": "Sanchez",

"email": "leonardo@gmail.com",

"phoneNumber": "+51912345678",



"status": "ACTIVE",                      // ACTIVE | INACTIVE | BANNED...


"locationLat": -12.046374,               // opcional: para clientes
"locationLng": -77.042793,               // (lat/lng para Google Maps)



"createdAt": "2025-11-17T15:32:00Z",
"updatedAt": "2025-11-17T15:32:00Z"

}
```
### WebSocketConnectionsTable
json

```
{
"connectionId": "abc123==",        // PK — clave de WebSocket (única por conexión)

"userId": "USER#123",              // qué usuario es

"tenantId": "TENANT#001",          // de qué sede es (multi-tenant)

"role": "DISPATCHER",              // USER | COOK | DISPATCHER | ADMIN

"connectedAt": "2025-11-17T15:32:00Z"


}
```
---

## 🔄 Flujo Simple del Sistema
### 1. **Cliente hace pedido**
text

```
Cliente se registra → Navega menú → Agrega productos al carrito → 
 → Recibe número de orden
```
### 2. **Restaurante procesa pedido**
text

```
Restaurante recibe pedido (de forma automatica) → Cheff asigna a cocineros (puede ser de forma automatica) → 
Cocineros preparan → Empacador empaqueta → 
Asignan repartidor (puede ser automatico) → Entregar al cliente
```
### 3. **Seguimiento en tiempo real**
text

```
Cada cambio de estado notifica al cliente via WebSocket (en la web)
```
---

## 🔌 WebSockets - Eventos Esenciales
### Para Cliente:
javascript (corregir o actualizar en base a la tabla de orders)

```
// Pedido confirmado
{
  "event": "order_confirmed",
  "orderId": "ord_123",
  "message": "Tu pedido #123 ha sido confirmado"
}

// En cocina
{
  "event": "in_kitchen",
  "message": "👨‍🍳 Tu pedido está en preparación"
}

// Cocinando
{
  "event": "cooking", 
  "message": "🔥 Tu hamburguesa está en la parrilla"
}

// Empacando
{
  "event": "packaging",
  "message": "📦 Tu pedido está siendo empaquetado"
}

// En camino
{
  "event": "on_the_way",
  "message": "🚗 Tu pedido está en camino - Llega en ~15 min"
}

// Entregado
{
  "event": "delivered",
  "message": "🎉 ¡Pedido entregado! ¡Disfruta!"
}
```
---

## 🎯 Roles del Sistema
| Rol | Descripción |
| ----- | ----- |
| **Cliente** | Usuario que hace pedidos desde la web |
|  |  |
| **Cheff Ejecutivo** | Asigna pedidos a cocineros |
| **Cocinero** | Prepara items asignados |
| **Empacador** | Empaqueta pedidos listos |
| **Repartidor** | Entrega pedidos a clientes |
| **Admin Sede** | Ve dashboard de su sede |
---

## 🚀 Stack Tecnológico AWS
| Servicio | Uso |
| ----- | ----- |
| **API Gateway** | REST API + WebSockets |
| **Lambda** | Lógica de microservicios (Node.js) |
| **DynamoDB** | Base de datos NoSQL |
| **S3** | Imágenes menú |
| **Amplify** | Frontend web React |
| **EventBridge** | Comunicación entre servicios |
| **Step Functions** | Orquestación del workflow de pedidos |
|  |  |
---



