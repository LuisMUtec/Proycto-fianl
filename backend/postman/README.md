# 📮 Postman Collections - Fridays Perú

Colecciones completas para probar todos los servicios del backend.

## 📦 Colecciones Disponibles

### 1️⃣ E-Commerce Service
**Archivo:** `Fridays-Ecommerce-Service.postman_collection.json`

**Endpoints incluidos:**
- 🔐 **AUTH** (4 endpoints)
  - Register, Login, Refresh Token, Logout
- 🍔 **MENU** (5 endpoints)
  - Listar productos, filtrar por categoría, buscar, ver detalles
- 🛒 **CART** (5 endpoints)
  - Agregar, ver, actualizar, eliminar, limpiar carrito
- 📦 **ORDERS** (5 endpoints)
  - Crear orden, ver orden, mis órdenes, listar todas, cancelar
- 💳 **PAYMENTS** (2 endpoints)
  - ⚡ Pago simulado 1-click (solo requiere orderId)
  - Create payment intent (opcional)
- ⚙️ **PRODUCTS ADMIN** (5 endpoints)
  - CRUD completo de productos

**Total:** 26 requests

---

### 2️⃣ Kitchen Service
**Archivo:** `Fridays-Kitchen-Service.postman_collection.json`

**Endpoints incluidos:**
- 📋 **ORDERS** (3 endpoints)
  - Ver pendientes, actualizar status, ver detalles
- 👨‍🍳 **CHEFS** (6 endpoints)
  - CRUD chefs, asignar a orden

**Total:** 9 requests

---

### 3️⃣ Delivery Service
**Archivo:** `Fridays-Delivery-Service.postman_collection.json`

**Endpoints incluidos:**
- 🚗 **DRIVERS** (6 endpoints)
  - CRUD repartidores, ver disponibles
- 📦 **ORDERS** (4 endpoints)
  - Asignar repartidor, actualizar status, tracking, ubicación GPS

**Total:** 10 requests

---

### 4️⃣ Admin Service
**Archivo:** `Fridays-Admin-Service.postman_collection.json`

**Endpoints incluidos:**
- 📊 **DASHBOARD** (4 endpoints)
  - Dashboard general, órdenes del día, métricas de ventas, productos top
- 👥 **USERS** (6 endpoints)
  - CRUD usuarios, cambiar rol
- 🏢 **SEDES** (5 endpoints)
  - CRUD sucursales

**Total:** 15 requests

---

### 5️⃣ WebSocket Service
**Archivo:** `Fridays-WebSocket-Service.postman_collection.json`

**Contenido:**
- 📡 Instrucciones de conexión WebSocket
- 📨 Ejemplo de envío de notificaciones
- 📋 Guía completa para probar (JavaScript, wscat, Browser)

**Nota:** WebSocket requiere cliente especial (no REST).

---

## 🚀 Cómo Usar las Colecciones

### Paso 1: Importar a Postman

1. Abre Postman
2. Click en **Import**
3. Arrastra los 5 archivos `.json` o selecciónalos
4. Confirm import

### Paso 2: Configurar Variables

Después de hacer `sls deploy`, actualiza las URLs base en cada colección:

#### E-Commerce Service
```
Variable: baseUrl
Valor: https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/dev
```

#### Kitchen Service
```
Variable: baseUrl
Valor: https://YOUR-KITCHEN-API-ID.execute-api.us-east-1.amazonaws.com/dev
```

#### Delivery Service
```
Variable: baseUrl
Valor: https://YOUR-DELIVERY-API-ID.execute-api.us-east-1.amazonaws.com/dev
```

#### Admin Service
```
Variable: baseUrl
Valor: https://YOUR-ADMIN-API-ID.execute-api.us-east-1.amazonaws.com/dev
```

#### WebSocket Service
```
Variable: wsUrl
Valor: wss://YOUR-WS-ID.execute-api.us-east-1.amazonaws.com/dev
```

**💡 Tip:** Las URLs aparecerán en la consola después de `sls deploy` o en el archivo `deployed-endpoints.txt` si usas `deploy-all.sh`.

### Paso 3: Flujo de Testing Recomendado

#### 1️⃣ Autenticación
```
E-Commerce > AUTH > Register
E-Commerce > AUTH > Login
```

Después del login, el **token JWT se guarda automáticamente** en la variable `{{token}}`.

#### 2️⃣ Menú y Carrito
```
E-Commerce > MENU > Listar Productos
E-Commerce > CART > Add to Cart
E-Commerce > CART > Get Cart
```

#### 3️⃣ Crear Orden
```
E-Commerce > ORDERS > Create Order (Checkout)
```

El `orderId` se guarda automáticamente en `{{orderId}}`.

#### 4️⃣ Pago Simulado (1 Click)
```
E-Commerce > PAYMENTS > Pagar Orden (1 Click)
```

**Body del request:**
```json
{
  "orderId": "{{orderId}}"
}
```

✅ **No necesitas tarjeta de crédito.** Es 100% simulado.

#### 5️⃣ Cocina
```
Kitchen > ORDERS > Get Pending Orders
Kitchen > ORDERS > Update Order Status
```

#### 6️⃣ Delivery
```
Delivery > DRIVERS > Get Available Drivers
Delivery > ORDERS > Assign Driver to Order
Delivery > ORDERS > Update Order Status
Delivery > ORDERS > Get Order Tracking
```

#### 7️⃣ Admin
```
Admin > DASHBOARD > Get Dashboard
Admin > DASHBOARD > Get Orders Today
```

---

## 🔑 Autenticación

### Token JWT Automático

Las colecciones están configuradas para usar **Bearer Token** automáticamente.

- Después de **Login**, el token se guarda en `{{token}}`
- Todos los requests subsiguientes usan ese token
- El token expira en 24h (puedes usar **Refresh Token**)

### Renovar Token Expirado

```
E-Commerce > AUTH > Refresh Token
```

---

## 📝 Variables de Colección

Cada colección maneja variables automáticamente:

| Variable | Descripción | Auto-guardado |
|----------|-------------|---------------|
| `baseUrl` | URL del API Gateway | ❌ Manual |
| `token` | JWT token | ✅ Automático |
| `orderId` | ID de orden creada | ✅ Automático |
| `connectionId` | WebSocket connection | ✅ Automático |

---

## 🧪 Scripts de Testing Incluidos

Las colecciones incluyen **scripts automáticos** que:

1. **Guardan tokens** después del login
2. **Guardan orderIds** después de crear órdenes
3. **Validan respuestas** (status code 200)
4. **Loguean resultados** en la consola de Postman

### Ver Scripts

En cualquier request:
1. Click en el request
2. Tab **Tests**
3. Verás el código JavaScript

---

## 🎯 Testing de Pago Simulado

### Endpoint Principal
```
POST /payments/confirm
```

### Body (Solo requiere orderId)
```json
{
  "orderId": "{{orderId}}"
}
```

### Respuesta Exitosa (95% casos)
```json
{
  "success": true,
  "paymentStatus": "PAID",
  "transactionId": "txn_sim_abc123",
  "simulation": true,
  "notice": "✅ Pago procesado instantáneamente"
}
```

### Respuesta Fallida (5% casos - testing)
```json
{
  "success": false,
  "paymentStatus": "FAILED",
  "error": "Pago rechazado",
  "simulation": true
}
```

**💡 Recuerda:** Es 100% simulado. No se procesa ningún pago real.

---

## 🌐 WebSocket Testing

Para probar WebSocket, usa una de estas opciones:

### Opción 1: wscat (CLI)
```bash
npm install -g wscat
wscat -c 'wss://YOUR-WS-ID.execute-api.us-east-1.amazonaws.com/dev?token=YOUR_TOKEN'
```

### Opción 2: Browser Console
```javascript
const token = 'YOUR_JWT_TOKEN';
const ws = new WebSocket(`wss://YOUR-WS-ID.execute-api.us-east-1.amazonaws.com/dev?token=${token}`);

ws.onopen = () => console.log('✅ Conectado');
ws.onmessage = (e) => console.log('📨', JSON.parse(e.data));
```

### Opción 3: Postman (v10+)
1. New → WebSocket Request
2. URL: `wss://YOUR-WS-ID.execute-api.us-east-1.amazonaws.com/dev?token={{token}}`
3. Connect

---

## 📊 Resumen de Endpoints

| Servicio | Requests | Requiere Auth |
|----------|----------|---------------|
| E-Commerce | 26 | Parcial* |
| Kitchen | 9 | ✅ Sí |
| Delivery | 10 | ✅ Sí |
| Admin | 15 | ✅ Sí |
| WebSocket | Especial | ✅ Sí |

*El menú público no requiere auth, el resto sí.

---

## 🐛 Troubleshooting

### ❌ Error: "Invalid token"
**Solución:** Haz login de nuevo:
```
E-Commerce > AUTH > Login
```

### ❌ Error: "Order not found"
**Solución:** Crea una orden primero:
```
E-Commerce > ORDERS > Create Order
```

### ❌ Error: "Cannot connect to WebSocket"
**Solución:** 
1. Verifica que el servicio WebSocket esté desplegado
2. Incluye el token en la URL: `?token=YOUR_TOKEN`
3. Usa `wss://` (no `https://`)

### ❌ Variables no se guardan
**Solución:**
1. Click en el ojo 👁️ (arriba derecha en Postman)
2. Verifica que `token` y `orderId` tengan valores
3. Si están vacías, corre Login/Create Order de nuevo

---

## 📚 Recursos Adicionales

- **Arquitectura:** Ver `ARCHITECTURE-AUDIT.md`
- **Deployment:** Ver `DEPLOYMENT-GUIDE.md` y `deploy-all.sh`
- **Payments:** Ver `PAYMENTS-SIMULATION.md` y `FRONTEND-PAYMENT-GUIDE.md`
- **Cleanup:** Ver `CLEANUP-REPORT.md`

---

## ✅ Checklist de Testing

Antes de integrar con el frontend, verifica:

- [ ] ✅ Register funciona
- [ ] ✅ Login devuelve token
- [ ] ✅ Listar menú (público) funciona
- [ ] ✅ Agregar al carrito funciona
- [ ] ✅ Crear orden funciona
- [ ] ✅ **Pago simulado funciona (1 click)**
- [ ] ✅ Ver mis órdenes funciona
- [ ] ✅ Cocina: Ver órdenes pendientes
- [ ] ✅ Delivery: Asignar repartidor
- [ ] ✅ Admin: Ver dashboard

---

## 🎉 ¡Listo para Probar!

1. Importa las 5 colecciones a Postman
2. Actualiza las `baseUrl` después del deploy
3. Sigue el flujo de testing recomendado
4. Disfruta probando el backend completo

**¿Dudas?** Revisa las descripciones dentro de cada request en Postman.
