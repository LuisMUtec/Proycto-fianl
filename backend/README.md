# 🍔 Fridays Backend - Sistema de Gestión de Órdenes

Backend serverless para el sistema de gestión de órdenes de Fridays, implementado con AWS Lambda, API Gateway, Step Functions, DynamoDB y EventBridge.

## 🚀 Deploy Rápido (3 pasos)

```bash
# 1️⃣ Instalar dependencias
npm install

# 2️⃣ Configurar serverless.yml
# - org: TU_USUARIO (línea 1)
# - role: arn:aws:iam::TU_ACCOUNT_ID:role/LabRole (línea 17)

# 3️⃣ Crear JWT secret y desplegar
aws ssm put-parameter --name "/fridays/jwt-secret" --value "$(openssl rand -base64 32)" --type "SecureString" --region us-east-1
sls deploy --stage dev --region us-east-1

# 4️⃣ Poblar base de datos
python scripts/seed-data.py --stage dev --region us-east-1
```

✅ **¡Listo!** Tu API está funcionando.

---

## 📋 Características

- **🔐 Autenticación JWT**: Sistema completo de auth con AWS Systems Manager Parameter Store
- **🛡️ Autorización por Roles**: USER, COOK, DISPATCHER, ADMIN
- **OrderWorkflow (Step Functions)**: Orquestación de creación de órdenes
- **API Gateway HTTP**: Endpoints REST para comandos
- **API Gateway WebSocket**: Notificaciones en tiempo real
- **EventBridge**: Bus de eventos para comunicación asíncrona
- **DynamoDB**: Persistencia de datos (Orders, Products, Users, WSConnections)
- **🍔 CRUD Productos**: Gestión completa del menú con S3 para imágenes
- **Multi-tenant**: Soporte para múltiples sedes
- **Python 3.11**: Lambdas en Python con boto3 y PyJWT

## 🏗️ Estructura del Proyecto

```
backend/
├── serverless.yml                   # Configuración de Serverless Framework
├── package.json                     # Dependencias de Node.js
├── requirements.txt                 # Dependencias de Python
├── .gitignore                       # Archivos ignorados por git
├── postman_collection.json          # Colección de Postman para pruebas
├── docs/
│   ├── ARCHITECTURE.md              # Documentación completa de arquitectura
│   ├── indicacionesGenerales.md     # Indicaciones para desarrollo
│   ├── documentacionEraser.md       # Documentación del diagrama
│   └── orderworkflow(step).md       # Detalle del workflow
├── functions/
│   ├── auth/
│   │   └── handler.py               # Lambda: Register & Login (JWT)
│   ├── producto-service/
│   │   └── handler.py               # Lambda: CRUD productos + S3
│   ├── order-workflow/
│   │   ├── prepare_order_data.py    # Lambda: Validar y preparar datos
│   │   ├── persist_and_build_order.py # Lambda: Persistir orden
│   │   └── publish_order_created_event.py # Lambda: Publicar evento
│   ├── update-status/
│   │   └── handler.py               # Lambda: Actualizar estado (protegido)
│   └── websocket/
│       ├── on_connect.py            # Lambda: WebSocket $connect
│       ├── on_disconnect.py         # Lambda: WebSocket $disconnect
│       └── order_events_to_ws.py    # Lambda: Broadcast a clientes
├── shared/
│   └── auth/
│       ├── jwt_utils.py             # Utilidades JWT (crear/validar tokens)
│       └── authorizer.py            # Lambda Authorizer para API Gateway
└── tablasDynamoDB/
    ├── dynamo_orders.md
    ├── dynamo_products.md
    ├── dynamo_users.md
    ├── dynamo_sedes.md
    └── dynamo_ws_connections.md
```

## 🚀 Instalación y Despliegue Rápido

### Prerrequisitos

- Node.js 18+ y npm
- Python 3.12+
- AWS CLI configurado con credenciales
- Cuenta de AWS Academy (o AWS regular)
- Serverless Framework v4

### ⚡ Quick Start (5 pasos)

#### 1️⃣ Instalar Dependencias

```bash
cd backend
npm install
```

#### 2️⃣ Configurar serverless.yml

Abre `serverless.yml` y ajusta estos campos:

```yaml
# Línea 1: Tu organización de Serverless
org: leonardogst  # 👈 CAMBIA ESTO por tu usuario

# Línea 17: Tu AWS Account ID
iam:
  role: arn:aws:iam::085989816475:role/LabRole  # 👈 CAMBIA el número por tu Account ID
```

**📋 Obtener tu AWS Account ID:**
```bash
aws sts get-caller-identity --query Account --output text
```

**Resultado:** `085989816475` (ejemplo) → Reemplaza este número en el `serverless.yml`

#### 3️⃣ Crear JWT Secret

```bash
# Generar y crear el secret en un solo comando
aws ssm put-parameter \
  --name "/fridays/jwt-secret" \
  --value "$(openssl rand -base64 32)" \
  --type "SecureString" \
  --region us-east-1
```

#### 4️⃣ Desplegar a AWS

```bash
serverless deploy --stage dev --region us-east-1
```

**⏱️ Tiempo estimado:** 2-3 minutos

**✅ Output esperado:**
```
endpoints:
  POST - https://k6jm5wvb0h.execute-api.us-east-1.amazonaws.com/dev/auth/register
  POST - https://k6jm5wvb0h.execute-api.us-east-1.amazonaws.com/dev/auth/login
  ...
  wss://i1gzzaf7nf.execute-api.us-east-1.amazonaws.com/dev

functions:
  authorizer: fridays-backend-dev-authorizer (165 kB)
  authRegister: fridays-backend-dev-authRegister (165 kB)
  ...

layers:
  pythonRequirements: arn:aws:lambda:us-east-1:085989816475:layer:fridays-backend-dev-python-requirements:3
```

**💾 Guarda estos endpoints:**
- `base_url`: https://k6jm5wvb0h... (para Postman)
- `ws_url`: wss://i1gzzaf7nf... (para WebSocket)

#### 5️⃣ Poblar Base de Datos

```bash
python scripts/seed-data.py --stage dev --region us-east-1
```

**✅ Esto crea:**
- 5 usuarios con roles (password: `todos123`)
  - cliente@fridays.com (USER)
  - chef@fridays.com (COOK)
  - chef2@fridays.com (COOK)
  - delivery@fridays.com (DISPATCHER)
  - admin@fridays.com (ADMIN)
- 10 productos del menú
- 3 sedes (Quito, Guayaquil, Cuenca)

---

### 🎯 Resumen de Cambios Necesarios

| Archivo | Campo | Qué Cambiar | Cómo Obtenerlo |
|---------|-------|-------------|----------------|
| `serverless.yml` (línea 1) | `org:` | Tu usuario de Serverless | Tu username |
| `serverless.yml` (línea 17) | `role:` | AWS Account ID | `aws sts get-caller-identity` |
| AWS Parameter Store | `/fridays/jwt-secret` | JWT secret | `openssl rand -base64 32` |

### 🔧 Verificación Post-Deploy

```bash
# 1. Verificar que el stack se creó
aws cloudformation describe-stacks \
  --stack-name fridays-backend-dev \
  --region us-east-1

# 2. Verificar las tablas de DynamoDB
aws dynamodb list-tables --region us-east-1 | grep fridays

# 3. Probar el endpoint de registro
curl -X POST https://TU_API_ID.execute-api.us-east-1.amazonaws.com/dev/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "firstName": "Test",
    "lastName": "User"
  }'

# ✅ Respuesta esperada:
# {
#   "message": "Usuario registrado exitosamente",
#   "user": { "userId": "...", "role": "USER", ... },
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# }
```

---

## 📦 Instalación Detallada (Opcional)

### Instalación de Dependencias

```bash
# Instalar dependencias de Node.js (plugins de Serverless)
npm install

# 🔥 NOTA: Las dependencias de Python (PyJWT, boto3) se instalan automáticamente
# durante el deploy mediante el sistema built-in de Serverless Framework v4
```

---

## 📦 Despliegue

### Configuración Previa al Deploy

```bash
# Desplegar en stage dev (por defecto)
serverless deploy --stage dev --region us-east-1

# Desplegar en stage prod
serverless deploy --stage prod --region us-east-1
```

### Outputs del Despliegue

Después del despliegue, obtendrás:

```
✅ Service deployed successfully

endpoints:
  # 🔐 Autenticación (Público)
  POST - https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/auth/register
  POST - https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/auth/login
  
  # 🍔 Productos (Público: GET, Protegido: POST/PUT)
  GET - https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/menu
  GET - https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/menu/{category}
  POST - https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/menu/productos
  PUT - https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/menu/items/{itemId}
  PUT - https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/menu/items/{itemId}/availability
  
  # 📦 Órdenes (Protegido con JWT)
  POST - https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/orders
  PUT - https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/orders/{tenantId}/{orderId}/status
  
websocket:
  wss://yyyyy.execute-api.us-east-1.amazonaws.com/dev

functions:
  authorizer: fridays-backend-dev-authorizer
  authRegister: fridays-backend-dev-authRegister
  productoService: fridays-backend-dev-productoService
  prepareOrderData: fridays-backend-dev-prepareOrderData
  persistAndBuildOrder: fridays-backend-dev-persistAndBuildOrder
  publishOrderCreatedEvent: fridays-backend-dev-publishOrderCreatedEvent
  updateStatus: fridays-backend-dev-updateStatus
  onConnect: fridays-backend-dev-onConnect
  onDisconnect: fridays-backend-dev-onDisconnect
  orderEventsToWS: fridays-backend-dev-orderEventsToWS

stepFunctions:
  orderWorkflow: arn:aws:states:us-east-1:ACCOUNT_ID:stateMachine:orderWorkflow-dev
```

**⚠️ Importante**: 
- Guarda el **ServiceEndpoint** (https) como `base_url` en Postman
- Guarda el **ServiceEndpointWebsocket** (wss) como `ws_url` en Postman
- Estos endpoints son necesarios para probar el flujo completo

## 📊 Poblar Base de Datos

Antes de probar, ejecuta el script de población de datos:

```bash
cd backend
python scripts/seed-data.py --stage dev --region us-east-1
```

Este script crea:
- ✅ **5 usuarios** con todos los roles (password: `todos123`):
  - cliente@fridays.com (USER)
  - chef@fridays.com (COOK)
  - chef2@fridays.com (COOK)
  - delivery@fridays.com (DISPATCHER)
  - admin@fridays.com (ADMIN)

- ✅ **10 productos** (4 FOOD, 3 DRINK, 2 DESSERT, 1 COMBO)
- ✅ **3 sedes** (Quito, Guayaquil, Cuenca)

**TenantId principal**: `sede-quito-001`

## 🧪 Pruebas

### 1. Importar Colección de Postman

1. Abre Postman
2. File → Import
3. Selecciona `backend/postman_collection.json`
4. Configura las variables de colección:
   - `base_url`: ServiceEndpoint del deployment (https://xxxxx...)
   - `ws_url`: ServiceEndpointWebsocket del deployment (wss://yyyyy...)
   - `tenant_id`: `sede-quito-001` (ya pre-configurado)
   - `product_id`: `prod-001` (ya pre-configurado)

### 2. Flujo de Prueba Completo

#### A. Login con Usuarios Pre-configurados

Usa cualquiera de estos requests (password para todos: `todos123`):

1. **Login - Cliente (USER)**
   - Email: cliente@fridays.com
   - Usa este usuario para crear órdenes

2. **Login - Chef (COOK)**
   - Email: chef@fridays.com
   - Usa este usuario para actualizar a COOKING, READY

3. **Login - Delivery (DISPATCHER)**
   - Email: delivery@fridays.com
   - Usa este usuario para PACKAGED, ON_THE_WAY, DELIVERED

4. **Login - Admin (ADMIN)**
   - Email: admin@fridays.com
   - Usa este usuario para gestionar productos

El token se guarda automáticamente en `{{auth_token}}` ✨

#### B. Crear Productos (Como Admin)

**Opcional**: El seed ya creó 10 productos. Si quieres crear más:

1. Ejecuta **Login - Admin**
2. Ejecuta **Crear Producto** en Postman

```json
POST {{base_url}}/menu/productos
Authorization: Bearer {{auth_token}}

{
  "name": "Hamburguesa Premium",
  "description": "Hamburguesa con queso cheddar",
  "category": "FOOD",
  "price": 22.5,
  "preparationTime": 15,
  "available": true
}
```

#### C. Listar Menú (Público)

```bash
GET {{base_url}}/menu
# No requiere autenticación
```

#### D. Crear Orden (Como Cliente)

1. Ejecuta **Login - Cliente (USER)**
2. Ejecuta **Crear Orden (Step Functions)** en Postman

```json
POST {{base_url}}/orders
Authorization: Bearer {{auth_token}}

{
  "items": [
    {
      "productId": "prod-001",
      "quantity": 2
    },
    {
      "productId": "prod-005",
      "quantity": 2
    }
  ],
  "notes": "Sin cebolla en la hamburguesa",
  "paymentMethod": "CARD"
}
```

**Productos del seed disponibles**:
- prod-001: Jack Daniel's Burger ($12.99)
- prod-002: Costillas BBQ ($18.50)
- prod-003: Alitas Picantes ($10.99)
- prod-005: Margarita Clásica ($7.50)
- prod-006: Limonada Natural ($3.50)

El `orderId` se guarda en `{{order_id}}` automáticamente ✨

#### E. Conectar WebSocket

**Opción 1: Postman WebSocket Request**
1. New Request → **WebSocket**
2. URL: `{{ws_url}}?userId={{user_id}}&tenantId={{tenant_id}}&role=USER`
3. Click **Connect**
4. Dejar la conexión abierta

**Opción 2: JavaScript (Frontend)**

```javascript
const userId = 'user-001'; // Del login
const tenantId = 'sede-quito-001';
const role = 'USER';

const ws = new WebSocket(
  `wss://YOUR_WS_ID.execute-api.us-east-1.amazonaws.com/dev?userId=${userId}&tenantId=${tenantId}&role=${role}`
);

ws.onopen = () => console.log('✅ Conectado al WebSocket');

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('📬 Nueva notificación:', notification);
  
  if (notification.type === 'ORDER_STATUS_CHANGED') {
    alert(`${notification.message} - Estado: ${notification.status}`);
  }
};

ws.onerror = (error) => console.error('❌ Error:', error);
ws.onclose = () => console.log('🔌 Desconectado');
```

#### F. Actualizar Estado de Orden (Como Chef)

1. **Mantén el WebSocket abierto** (del paso anterior)
2. Ejecuta **Login - Chef (COOK)**
3. Ejecuta **Actualizar a COOKING** en Postman

```json
PUT {{base_url}}/orders/{{tenant_id}}/{{order_id}}/status
Authorization: Bearer {{auth_token}}

{
  "status": "COOKING",
  "notes": "Asignado a estación de parrilla"
}
```

4. **Verifica el WebSocket**: Debes recibir notificación "👨‍🍳 Tu pedido está en preparación"

#### G. Continuar Flujo de Estados

**Como Chef** (actualizar a READY):
```json
PUT {{base_url}}/orders/{{tenant_id}}/{{order_id}}/status
Authorization: Bearer {{auth_token}}

{
  "status": "READY",
  "notes": "Listo para empaquetar"
}
```

**Como Delivery** (ejecuta **Login - Delivery** primero):
```json
# PACKAGED
PUT {{base_url}}/orders/{{tenant_id}}/{{order_id}}/status
{ "status": "PACKAGED", "notes": "Empaquetado" }

# ON_THE_WAY
PUT {{base_url}}/orders/{{tenant_id}}/{{order_id}}/status
{ "status": "ON_THE_WAY", "notes": "En camino" }

# DELIVERED
PUT {{base_url}}/orders/{{tenant_id}}/{{order_id}}/status
{ "status": "DELIVERED", "notes": "Entregado" }
```

Cada actualización dispara una notificación WebSocket con emoji correspondiente 🎉

---

## 🔐 Autenticación JWT

### Setup del JWT Secret

Antes del deployment, crea el secret en AWS Systems Manager Parameter Store:

### Orders
- **PK**: orderId
- **Atributos**: tenantId, userId, status, items, total, timeline, cookId, dispatcherId
- **GSI**: tenantId-status-index, tenantId-createdAt-index

### WSConnections
- **PK**: connectionId
- **Atributos**: userId, tenantId, role, connectedAt, ttl
- **GSI**: userId-index, tenantId-index

### Products
- **PK**: productId
- **Atributos**: tenantId, name, price, isAvailable, category
- **GSI**: tenantId-index

### Users
- **PK**: userId
- **Atributos**: tenantId, email, firstName, lastName, role
- **GSI**: email-index, tenantId-index

### Sedes
- **PK**: tenantId
- **Atributos**: name, code, address, lat, lng, status

## 🔍 Logs y Debugging

### Ver logs de una Lambda

```bash
# Ver logs de updateStatus
serverless logs -f updateStatus --tail

# Ver logs de orderEventsToWS (broadcast)
serverless logs -f orderEventsToWS --tail

# Ver logs de Step Functions
aws stepfunctions describe-execution \
  --execution-arn "arn:aws:states:us-east-1:ACCOUNT_ID:execution:orderWorkflow-dev:EXECUTION_ID"
```

### CloudWatch Logs

- Lambda logs: `/aws/lambda/fridays-backend-dev-FUNCTION_NAME`
- Step Functions: En la consola de Step Functions → Execution history

## 🛠️ Comandos Útiles

```bash
# Ver información del stack
serverless info

# Invocar una Lambda manualmente
serverless invoke -f prepareOrderData --data '{"requestId":"test","tenantId":"TENANT#001","userId":"USER#123","items":[]}'

# Eliminar todo el stack
serverless remove
```

## 📖 Documentación Adicional

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)**: Documentación completa de la arquitectura
- **[indicacionesGenerales.md](docs/indicacionesGenerales.md)**: Indicaciones para desarrollo
- **Postman Collection**: Ejemplos de todos los endpoints

## 🔐 Seguridad y Autenticación

### Sistema JWT Completo

Este proyecto implementa autenticación JWT con:

- **Secret almacenado en**: AWS Systems Manager Parameter Store (`/fridays/jwt-secret`)
- **Validez del token**: 7 días
- **Algoritmo**: HS256 (HMAC con SHA-256)
- **Lambda Authorizer**: Valida automáticamente todos los endpoints protegidos

### Flujo de Autenticación

```
1. Usuario → POST /auth/register o /auth/login
2. Backend valida credenciales
3. Backend genera JWT con: userId, email, role, tenantId
4. Cliente guarda token
5. Cliente incluye en cada request: Authorization: Bearer <token>
6. Lambda Authorizer valida automáticamente antes de ejecutar la Lambda
7. Lambda recibe información del usuario en event.requestContext.authorizer
```

### Endpoints Protegidos

| Endpoint | Método | Roles Permitidos | Descripción |
|----------|--------|------------------|-------------|
| `/orders` | POST | Todos autenticados | Crear orden |
| `/orders/{tenantId}/{orderId}/status` | PUT | COOK, DISPATCHER, ADMIN | Actualizar estado |
| `/menu/productos` | POST | ADMIN | Crear producto |
| `/menu/items/{itemId}` | PUT | ADMIN | Actualizar producto |
| `/menu/items/{itemId}/availability` | PUT | ADMIN | Cambiar disponibilidad |

### Roles del Sistema

| Rol | Descripción | tenantId Requerido |
|-----|-------------|--------------------|
| **USER** | Cliente que hace pedidos | No |
| **COOK** | Cocinero que prepara órdenes | Sí |
| **DISPATCHER** | Empaquetador/Repartidor | Sí |
| **ADMIN** | Administrador de sede | Sí |

### AWS Academy - LabRole

Este proyecto está configurado para AWS Academy usando `LabRole`:

```yaml
role: arn:aws:iam::${aws:accountId}:role/LabRole
```

**LabRole incluye permisos para:**
- DynamoDB (lectura/escritura)
- EventBridge (put events)
- API Gateway Management API (post to connection)
- Systems Manager Parameter Store (get parameter)
- S3 (futuro: imágenes)

### Validaciones Implementadas

- ✅ Autenticación JWT en endpoints protegidos
- ✅ Autorización por roles (USER, COOK, DISPATCHER, ADMIN)
- ✅ Validación de tenantId en todas las operaciones
- ✅ Validación de productos y usuarios
- ✅ Validación de estados de orden
- ✅ Password hasheado con SHA-256
- ✅ TTL automático en conexiones WebSocket (24 horas)

## 🚨 Troubleshooting

### Autenticación y JWT

#### Error: "No se pudo obtener el JWT secret"
**Causa**: El parámetro no existe en Parameter Store

**Solución**:
```bash
# Verificar que existe
aws ssm get-parameter --name "/fridays/jwt-secret" --with-decryption

# Si no existe, crearlo
aws ssm put-parameter \
  --name "/fridays/jwt-secret" \
  --value "$(openssl rand -base64 32)" \
  --type "SecureString"
```

#### Error: "Token inválido" o "Token expirado"
**Causa**: Token JWT vencido o secret incorrecto

**Solución**:
```bash
# Hacer login nuevamente
POST /auth/login

# El token expira en 7 días
```

#### Error: "Forbidden - No tienes permisos"
**Causa**: Usuario no tiene el rol correcto

**Solución**:
- Endpoints de productos requieren rol **ADMIN**
- Actualización de estados requiere rol **COOK**, **DISPATCHER** o **ADMIN**
- Verificar el rol en el response del login:
```json
{
  "user": {
    "role": "USER"  // ← Verificar este valor
  }
}
```

#### Error: "Unauthorized" en endpoints protegidos
**Causa**: No se está enviando el token o el formato es incorrecto

**Solución**:
```bash
# Verificar que el header esté correcto
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NO usar:
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # ❌ Falta "Bearer"
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...        # ❌ Falta "Authorization:"
```

### Creación de Órdenes

#### Error: "Producto no encontrado"
**Causa**: El productId no existe en DynamoDB

**Solución**:
1. Primero crear productos con POST /menu/productos (como ADMIN)
2. Guardar el productId devuelto
3. Usar ese productId en la creación de órdenes

#### Error: "Usuario no encontrado"
**Causa**: El userId no existe

**Solución**:
- Usar el userId del token JWT (se obtiene automáticamente del authorizer)
- O asegurarte de que el usuario esté registrado

### Error: "No se puede crear el rol"

**Solución**: Estás en AWS Academy, usa `LabRole` (ya configurado en serverless.yml).

### WebSocket no recibe mensajes
1. Verifica que la conexión esté registrada en DynamoDB `WSConnections`
2. Verifica el `WEBSOCKET_ENDPOINT` en la Lambda `orderEventsToWS`
3. Revisa CloudWatch Logs de `orderEventsToWS`

### Orden no se crea
1. Verifica que los productos existan en `Products`
2. Verifica que el usuario exista en `Users`
3. Revisa logs de Step Functions

### Estado no se actualiza
1. Verifica que `orderId` y `tenantId` sean correctos
2. Verifica que el estado sea válido (CREATED, COOKING, READY, etc.)
3. Revisa logs de `updateStatus`

## 📞 Soporte

Para más detalles sobre la arquitectura y flujos, consulta:
- `docs/ARCHITECTURE.md` - Documentación completa
- `postman_collection.json` - Ejemplos de pruebas

## 📝 Estados de Orden

```
CREATED → COOKING → READY → PACKAGED → ON_THE_WAY → DELIVERED
             ↓
         CANCELLED
```

## 🎯 Próximos Pasos

Después de desplegar el backend:

1. ✅ Configurar los endpoints en el frontend
2. ✅ Poblar las tablas con datos iniciales (productos, usuarios, sedes)
3. ✅ Probar el flujo completo con Postman
4. ✅ Conectar el WebSocket en el frontend
5. ✅ Implementar autenticación JWT (si aplica)

---

**Autor**: Sistema de Gestión de Órdenes - Fridays Perú  
**Versión**: 1.0  
**Fecha**: Noviembre 2025
