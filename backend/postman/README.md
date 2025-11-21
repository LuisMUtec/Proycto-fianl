# 📬 Colecciones de Postman - Fridays Perú

Este directorio contiene las colecciones de Postman para probar todos los microservicios del proyecto.

## 📦 Colecciones Disponibles

### 1️⃣ Delivery Service
**Archivo:** `Delivery-Service.postman_collection.json`

**Puerto Local:** `3003`

**Endpoints:**
- ✅ `GET /api/delivery/drivers` - Listar todos los repartidores
- ✅ `GET /api/delivery/drivers/available` - Repartidores disponibles
- ✅ `POST /api/delivery/drivers` - Crear repartidor
- ✅ `POST /api/delivery/orders/:orderId/assign` - Asignar repartidor a orden
- ✅ `PUT /api/delivery/orders/:orderId/status` - Actualizar estado de entrega

---

### 2️⃣ Admin Service
**Archivo:** `Admin-Service.postman_collection.json`

**Puerto Local:** `3004`

**Endpoints:**
- ✅ `GET /api/admin/dashboard` - Estadísticas del dashboard
- ✅ `GET /api/admin/orders/today` - Órdenes del día
- ✅ `GET /api/admin/users` - Listar usuarios (con filtro por rol)
- ✅ `POST /api/admin/users` - Crear usuario
- ✅ `GET /api/admin/sedes` - Listar sedes

---

### 3️⃣ WebSocket Service
**Archivo:** `WebSocket-Service.postman_collection.json`

**Puerto Local:** `3005`

**Conexión:** `ws://localhost:3005`

**Eventos:**
- 🔌 `$connect` - Conexión WebSocket
- 🔌 `$disconnect` - Desconexión
- 📨 `OrderStatusChanged` - Cambio de estado de orden (EventBridge)

---

## 🚀 Cómo Importar en Postman

### Opción 1: Importar Individual
1. Abre Postman
2. Clic en **"Import"** (arriba a la izquierda)
3. Arrastra el archivo `.json` o selecciona **"Upload Files"**
4. Selecciona el archivo de la colección
5. Clic en **"Import"**

### Opción 2: Importar Todas
1. Abre Postman
2. Clic en **"Import"**
3. Selecciona los 3 archivos `.json` a la vez
4. Clic en **"Import"**

---

## ⚙️ Configuración de Variables

Cada colección tiene variables pre-configuradas para desarrollo local:

### Delivery Service
```json
{
  "base_url_delivery": "http://localhost:3003/local",
  "jwt_token": "mock-token-for-local-dev",
  "driver_id": ""
}
```

### Admin Service
```json
{
  "base_url_admin": "http://localhost:3004/local",
  "jwt_token": "mock-token-for-local-dev"
}
```

### WebSocket Service
```json
{
  "websocket_url": "ws://localhost:3005"
}
```

---

## 🧪 Orden Sugerido para Probar

### 1️⃣ Primero: Delivery Service

```bash
# 1. Listar repartidores existentes
GET /api/delivery/drivers

# 2. Crear un nuevo repartidor
POST /api/delivery/drivers
{
  "tenantId": "TENANT#001",
  "firstName": "Pedro",
  "lastName": "Ramirez",
  "email": "pedro@fridays.pe",
  "password": "password123",
  "phoneNumber": "+51989012345"
}

# 3. Ver repartidores disponibles
GET /api/delivery/drivers/available
```

### 2️⃣ Segundo: Admin Service

```bash
# 1. Ver dashboard
GET /api/admin/dashboard

# 2. Listar usuarios
GET /api/admin/users

# 3. Crear un cocinero
POST /api/admin/users
{
  "tenantId": "TENANT#001",
  "role": "COCINERO",
  "firstName": "Miguel",
  "lastName": "Fernandez",
  "email": "miguel@fridays.pe",
  "password": "password123",
  "phoneNumber": "+51990123456"
}

# 4. Ver sedes
GET /api/admin/sedes
```

### 3️⃣ Tercero: WebSocket (Requiere herramientas especiales)

Para WebSocket necesitas usar:
- **Postman WebSocket Request** (versión Desktop)
- **wscat** (CLI): `npm install -g wscat`
- **Cliente JavaScript** en el navegador

---

## 🔐 Autenticación

### Desarrollo Local (Mock Auth)
En desarrollo local, la autenticación está en modo **mock**. Cualquier token funciona:

```
Authorization: Bearer mock-token-for-local-dev
```

El middleware `mock-auth` simula un usuario autenticado con estos datos:
```javascript
{
  userId: "mock-user-id",
  email: "test@fridays.pe",
  role: "ADMIN_SEDE",
  tenantId: "TENANT#001"
}
```

### Producción (JWT Real)
En AWS, necesitarás un JWT válido obtenido del servicio de autenticación.

---

## 📋 Usuarios de Prueba (Seed Data)

Los siguientes usuarios están pre-cargados en DynamoDB local:

| Email | Rol | Password | Sede |
|-------|-----|----------|------|
| leonardo@gmail.com | CLIENTE | password123 | - |
| ana.digitador@fridays.pe | DIGITADOR | password123 | San Isidro |
| carlos.chef@fridays.pe | CHEF_EJECUTIVO | password123 | San Isidro |
| luis.cocinero@fridays.pe | COCINERO | password123 | San Isidro |
| jose.empacador@fridays.pe | EMPACADOR | password123 | San Isidro |
| maria.repartidor@fridays.pe | REPARTIDOR | password123 | San Isidro |
| admin@fridays.pe | ADMIN_SEDE | password123 | San Isidro |

---

## 🐛 Troubleshooting

### Error: "Connection refused"
```bash
# Verifica que el servicio esté corriendo
cd services/delivery-service
npm run dev

# Debe mostrar: "Server ready: http://localhost:3003 🚀"
```

### Error: "ResourceNotFoundException"
```bash
# DynamoDB Local no está corriendo o no tiene tablas
docker ps  # Verificar contenedor dynamodb-local

# Si no está corriendo:
npm run local:dynamodb
npm run setup:tables
npm run seed:data
```

### Error: 401 Unauthorized (en AWS)
El token JWT no es válido o ha expirado. Obtén uno nuevo del servicio de autenticación.

---

## 📚 Recursos Adicionales

- **Documentación API:** Ver `../README.md`
- **Schema de Base de Datos:** Ver `../DATABASE-SCHEMA.md`
- **Setup de AWS:** Ver `../AWS-SETUP.md`

---

## 🎯 Testing de Integración

### Flujo Completo: Crear Orden → Asignar → Entregar

1. **Crear un pedido** (desde ecommerce-service - TODO)
2. **Asignar repartidor:**
   ```
   POST /api/delivery/orders/ORDER#001/assign
   { "driverId": "user-uuid" }
   ```
3. **Actualizar a "En camino":**
   ```
   PUT /api/delivery/orders/ORDER#001/status
   { "status": "DELIVERING", "location": {...} }
   ```
4. **Marcar como entregado:**
   ```
   PUT /api/delivery/orders/ORDER#001/status
   { "status": "DELIVERED" }
   ```
5. **Ver en dashboard:**
   ```
   GET /api/admin/dashboard
   GET /api/admin/orders/today
   ```

---

## 💡 Tips

1. **Usa Variables de Colección:** Los IDs de drivers/orders se guardan automáticamente en variables para usarlas en otros requests.

2. **Tests Automatizados:** Cada request puede tener scripts de prueba en la pestaña "Tests".

3. **Environments:** Crea un Environment para dev, staging y producción con diferentes URLs.

4. **WebSocket Testing:** Para probar en tiempo real, mantén una conexión WebSocket abierta mientras haces requests al Delivery API.

---

¿Preguntas? Revisa la documentación principal o contacta al equipo. 🚀
