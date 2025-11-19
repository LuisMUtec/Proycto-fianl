# Fridays Perú - Sistema de Gestión de Pedidos 🍔

## 📁 Estructura del Proyecto

Este es un sistema serverless modular basado en microservicios para la gestión de pedidos de Fridays Perú.

### 🏗️ Arquitectura

```
backend/
├── services/                    # Microservicios
│   ├── ecommerce-service/      # Persona 1: E-commerce y Pedidos
│   ├── kitchen-service/        # Persona 2: Cocina y Menú
│   ├── delivery-service/       # Persona 3: Delivery y Repartidores
│   ├── admin-service/          # Persona 3: Dashboard y Admin
│   └── websocket-service/      # WebSockets (Compartido)
├── shared/                      # Código compartido
│   ├── utils/                  # Utilidades
│   ├── models/                 # Modelos de datos
│   ├── middlewares/            # Middlewares
│   ├── database/               # Helpers de DynamoDB
│   └── constants/              # Constantes
└── infrastructure/             # Configuración de infraestructura
```

## 🎯 Microservicios

### 1. E-commerce Service (Persona 1)
**Puerto:** 3001
- Menú y catálogo
- Autenticación de clientes
- Carrito de compras
- Gestión de pedidos (cliente)

### 2. Kitchen Service (Persona 2)
**Puerto:** 3002
- Gestión de cocina
- Asignación de pedidos
- Gestión de menú (Admin)
- Autenticación de staff

### 3. Delivery Service (Persona 3)
**Puerto:** 3003
- Asignación de repartidores
- Seguimiento de entregas
- Gestión de repartidores

### 4. Admin Service (Persona 3)
**Puerto:** 3004
- Dashboard de métricas
- Gestión de sedes
- CRUD de usuarios staff

### 5. WebSocket Service
**Puerto:** 3005
- Notificaciones en tiempo real
- Conexiones WebSocket

## 🚀 Próximos Pasos

1. Instalar dependencias en cada servicio:
   ```bash
   cd services/[nombre-servicio]
   npm install
   ```

2. Implementar funciones Lambda en cada carpeta `functions/`

3. Configurar las tablas DynamoDB necesarias:
   - t_menu
   - OrdersTable
   - UsersTable
   - WebSocketConnectionsTable

4. Desarrollar las funciones según los endpoints asignados

## 📦 Stack Tecnológico

- **AWS Lambda** - Funciones serverless
- **API Gateway** - REST API + WebSockets
- **DynamoDB** - Base de datos NoSQL
- **Node.js 18.x** - Runtime
- **Serverless Framework** - Deployment

## 👥 División del Trabajo

- **Persona 1 (Leonardo):** E-commerce Service 
- **Persona 2 (Luis):** Kitchen Service
- **Persona 3 (Nayeli):** Delivery Service + Admin Service

---

**Nota:** Esta es la estructura base. Cada persona debe implementar sus funciones Lambda en las carpetas correspondientes.
