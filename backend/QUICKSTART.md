# 🚀 GUÍA RÁPIDA DE DEPLOYMENT

## ⚡ Setup en 5 Minutos

### Paso 1: JWT Secret (30 segundos)
```bash
aws ssm put-parameter \
  --name "/fridays/jwt-secret" \
  --value "$(openssl rand -base64 32)" \
  --type "SecureString" \
  --region us-east-1
```

### Paso 2: Deploy (2-3 minutos)
```bash
cd backend
npm install
serverless deploy --stage dev --region us-east-1
```

**⚠️ IMPORTANTE**: Guarda estos outputs:
- `ServiceEndpoint` (https://xxxxx...) → Variable `base_url` en Postman
- `ServiceEndpointWebsocket` (wss://yyyyy...) → Variable `ws_url` en Postman

### Paso 3: Poblar Datos (1 minuto)
```bash
python scripts/seed-data.py --stage dev --region us-east-1
```

Esto crea:
- ✅ 5 usuarios (cliente, chef, chef2, delivery, admin) - password: `todos123`
- ✅ 10 productos (FOOD, DRINK, DESSERT, COMBO)
- ✅ 3 sedes (Quito, Guayaquil, Cuenca)

---

## 🧪 Testing en Postman (5 minutos)

### 1. Importar Colección
- File → Import → `backend/postman_collection.json`

### 2. Configurar Variables
- `base_url`: https://xxxxx... (del deploy)
- `ws_url`: wss://yyyyy... (del deploy)
- `tenant_id`: sede-quito-001 (ya está)
- `product_id`: prod-001 (ya está)

### 3. Flujo de Prueba

#### A. Login como Cliente
```
Request: "Login - Cliente (USER)"
Email: cliente@fridays.com
Password: todos123

✅ Token guardado automáticamente en {{auth_token}}
```

#### B. Crear Orden
```
Request: "Crear Orden (Step Functions)"
Body:
{
  "items": [
    {"productId": "prod-001", "quantity": 2},
    {"productId": "prod-005", "quantity": 2}
  ],
  "notes": "Sin cebolla",
  "paymentMethod": "CARD"
}

✅ orderId guardado en {{order_id}}
```

#### C. Conectar WebSocket
```
1. New Request → WebSocket
2. URL: {{ws_url}}?userId={{user_id}}&tenantId={{tenant_id}}&role=USER
3. Click Connect
4. Dejar abierto
```

#### D. Actualizar Estado como Chef
```
1. Request: "Login - Chef (COOK)"
2. Request: "Actualizar a COOKING"

✅ WebSocket recibe: "👨‍🍳 Tu pedido está en preparación"
```

#### E. Continuar con Delivery
```
1. Request: "Login - Delivery (DISPATCHER)"
2. Request: "Actualizar a PACKAGED"
3. Request: "Actualizar a ON_THE_WAY"
4. Request: "Actualizar a DELIVERED"

✅ WebSocket recibe notificación en cada cambio
```

---

## 🌐 WebSocket en Frontend

```javascript
// Obtener userId del JWT después del login
const userId = 'user-001'; // Del localStorage o JWT
const tenantId = 'sede-quito-001';
const role = 'USER';

// Conectar (reemplaza YOUR_WS_ID con el del deploy)
const ws = new WebSocket(
  `wss://YOUR_WS_ID.execute-api.us-east-1.amazonaws.com/dev?userId=${userId}&tenantId=${tenantId}&role=${role}`
);

ws.onopen = () => {
  console.log('✅ Conectado al WebSocket');
};

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  
  console.log('📬 Nueva notificación:', notification);
  
  // Mostrar notificación al usuario
  if (notification.type === 'ORDER_STATUS_CHANGED') {
    showNotification(notification.message, notification.status);
  } else if (notification.type === 'ORDER_CREATED') {
    showNotification('¡Tu pedido ha sido confirmado!', 'success');
  }
};

ws.onerror = (error) => {
  console.error('❌ Error WebSocket:', error);
};

ws.onclose = () => {
  console.log('🔌 Desconectado del WebSocket');
  // Intentar reconectar después de 5 segundos
  setTimeout(() => connectWebSocket(), 5000);
};

function showNotification(message, status) {
  // Tu lógica de notificaciones (toast, alert, etc.)
  const emoji = {
    'CREATED': '✅',
    'COOKING': '👨‍🍳',
    'READY': '🔔',
    'PACKAGED': '📦',
    'ON_THE_WAY': '🚗',
    'DELIVERED': '🎉',
    'CANCELLED': '❌'
  };
  
  alert(`${emoji[status] || '📬'} ${message}`);
}
```

---

## 🔑 Credenciales Rápidas

| Email | Password | Rol | Para |
|-------|----------|-----|------|
| cliente@fridays.com | todos123 | USER | Crear órdenes |
| chef@fridays.com | todos123 | COOK | Cocinar (COOKING, READY) |
| delivery@fridays.com | todos123 | DISPATCHER | Despachar (PACKAGED, ON_THE_WAY, DELIVERED) |
| admin@fridays.com | todos123 | ADMIN | Gestionar productos |

**TenantId**: sede-quito-001

---

## 📦 Productos Disponibles

| ProductId | Nombre | Precio | Categoría |
|-----------|--------|--------|-----------|
| prod-001 | Jack Daniel's Burger | $12.99 | FOOD |
| prod-002 | Costillas BBQ | $18.50 | FOOD |
| prod-003 | Alitas Picantes | $10.99 | FOOD |
| prod-004 | Caesar Salad | $9.99 | FOOD |
| prod-005 | Margarita Clásica | $7.50 | DRINK |
| prod-006 | Limonada Natural | $3.50 | DRINK |
| prod-007 | Cerveza Corona | $4.00 | DRINK |
| prod-008 | Brownie con Helado | $6.99 | DESSERT |
| prod-009 | Cheesecake de Fresa | $5.99 | DESSERT |
| prod-010 | Combo Familiar | $39.99 | COMBO |

---

## 🐛 Troubleshooting Rápido

### Error: "JWT secret not found"
```bash
# Verificar que existe
aws ssm get-parameter --name "/fridays/jwt-secret" --region us-east-1

# Si no existe, crear
aws ssm put-parameter --name "/fridays/jwt-secret" \
  --value "$(openssl rand -base64 32)" --type "SecureString"
```

### Error: "Token has expired"
```
Solución: Hacer login nuevamente
- El token JWT dura 7 días
- Ejecuta cualquier request de "Login" para obtener uno nuevo
```

### Error: "Forbidden" (403)
```
Causas comunes:
1. No tienes el rol correcto (ej: intentas crear producto sin ser ADMIN)
2. Intentas acceder a recursos de otro tenant
3. Token no incluido en header Authorization

Solución:
- Verifica que estás logueado con el rol correcto
- Verifica header: Authorization: Bearer {{auth_token}}
```

### WebSocket no recibe mensajes
```
Checklist:
1. ✅ URL correcta (wss://...)
2. ✅ Query params: userId, tenantId, role
3. ✅ Conexión establecida (onopen llamado)
4. ✅ Orden pertenece al mismo tenantId
```

---

## 📚 Documentación Completa

- 📖 `backend/README.md` - Setup detallado y arquitectura
- 📋 `backend/SUMMARY.md` - Resumen ejecutivo del proyecto
- 📡 `backend/postman_collection.json` - Colección de tests
- 🏗️ `backend/docs/ARCHITECTURE.md` - Documentación técnica

---

## ✨ Próximos Pasos

1. ✅ **Deploy completado** → Probar en Postman
2. ✅ **Postman funcionando** → Integrar con frontend
3. ✅ **Frontend conectado** → Implementar notificaciones push
4. 🚀 **Sistema en producción** → Agregar métricas y monitoreo

---

**Estado**: ✅ **LISTO PARA PRODUCCIÓN**

💡 **Tip**: Guarda el `base_url` y `ws_url` en variables de entorno del frontend para cambiar fácilmente entre dev/prod.
