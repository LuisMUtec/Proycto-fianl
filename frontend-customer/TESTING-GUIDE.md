# 🧪 Guía de Pruebas - Frontend Customer con Backend AWS

## 📋 Checklist de Pruebas

### 1. ✅ Menú y Catálogo (Público - No requiere login)

#### Visualización del Menú
- [ ] Abrir http://localhost:5173/menu
- [ ] Ver productos cargados desde backend AWS
- [ ] Ver imágenes de productos
- [ ] Ver precios correctos (formato S/ XX.XX)
- [ ] Ver descripciones completas
- [ ] Ver badge de disponibilidad (verde/rojo)

#### Búsqueda de Productos
- [ ] Escribir "hamburguesa" en el buscador
- [ ] Click en botón "Buscar"
- [ ] Ver resultados filtrados
- [ ] Ver mensaje "Mostrando resultados para: hamburguesa"
- [ ] Click en "Limpiar búsqueda"
- [ ] Ver todos los productos de nuevo
- [ ] Usar botón "X" para limpiar el campo

#### Filtrado por Categorías
- [ ] Click en botón "Todas" → Ver todos los productos
- [ ] Click en "Bebidas" → Ver solo bebidas
- [ ] Click en "Comida" → Ver solo comidas
- [ ] Click en "Postres" → Ver solo postres
- [ ] Verificar que el botón activo está resaltado en rojo
- [ ] Verificar contador de productos: "Bebidas (12)"

#### Agregar al Carrito (Sin Login)
- [ ] Click en "Agregar" en un producto disponible
- [ ] Ver mensaje "✅ [Producto] agregado al carrito"
- [ ] Carrito guardado en localStorage
- [ ] Refrescar página → carrito persiste

### 2. 🔐 Autenticación

#### Registro
- [ ] Navegar a /register
- [ ] Ingresar datos: nombre, email, password
- [ ] Click en "Registrarse"
- [ ] Verificar registro exitoso
- [ ] Verificar que el rol es forzado a "Cliente"

#### Login
- [ ] Navegar a /login
- [ ] Ingresar email y password
- [ ] Click en "Iniciar sesión"
- [ ] Verificar redirección a dashboard/home
- [ ] Verificar que el navbar muestra usuario logueado
- [ ] **IMPORTANTE**: Verificar que WebSocket se conecta automáticamente

#### Validación de Rol
- [ ] Intentar login con usuario "Admin" o "Cocinero"
- [ ] Verificar que se bloquea el acceso
- [ ] Ver mensaje: "Solo usuarios con rol Cliente pueden acceder"

#### Logout
- [ ] Click en botón "Cerrar sesión"
- [ ] Verificar que tokens se eliminan
- [ ] Verificar que WebSocket se desconecta
- [ ] Verificar redirección a home

### 3. 🛒 Carrito (Con Usuario Logueado)

#### Sincronización con Backend
- [ ] Agregar productos al carrito sin login
- [ ] Hacer login
- [ ] **Verificar auto-sync**: carrito local se sincroniza con servidor
- [ ] Abrir DevTools → Network → Ver POST a `/cart/sync`
- [ ] Agregar más productos estando logueado
- [ ] Verificar que cada cambio llama a `/cart/sync`

#### Gestión del Carrito
- [ ] Agregar producto con cantidad 1
- [ ] Aumentar cantidad → Ver sync automático
- [ ] Disminuir cantidad → Ver sync automático
- [ ] Eliminar producto → Ver sync automático
- [ ] Cerrar sesión y volver a entrar → carrito persiste

### 4. 📦 Órdenes (Implementación Pendiente)

#### Crear Orden
- [ ] Ir a checkout con productos en carrito
- [ ] Llenar datos de entrega
- [ ] Click en "Crear orden"
- [ ] Verificar llamada a POST `/orders`
- [ ] Ver orden creada con estado "CREATED"

#### Listar Órdenes
- [ ] Navegar a /orders
- [ ] Ver historial de órdenes
- [ ] Ver estados: CREATED, PAID, PREPARING, etc.
- [ ] Click en una orden → Ver detalles

### 5. 💳 Pagos (Simulado - Implementación Pendiente)

#### Pago 1-Click
- [ ] En orden con estado CREATED
- [ ] Click en "Confirmar pago"
- [ ] Verificar llamada a POST `/payments/confirm`
- [ ] NO solicita datos de tarjeta
- [ ] Ver resultado:
  - 95% de casos: "Pago exitoso" → orden pasa a PAID
  - 5% de casos: "Pago fallido" (para testing)

### 6. 📍 Tracking (Implementación Pendiente)

#### Tracking del Repartidor
- [ ] Orden en estado IN_TRANSIT
- [ ] Navegar a /tracking/:orderId
- [ ] Ver mapa con ubicación del repartidor
- [ ] Ver datos del repartidor (nombre, placa, teléfono)
- [ ] Ver ruta estimada
- [ ] Ver ETA (tiempo estimado de llegada)

### 7. 🔔 WebSocket - Notificaciones en Tiempo Real

#### Conexión Automática
- [ ] Hacer login
- [ ] Abrir DevTools → Console
- [ ] Ver mensaje: "WebSocket connected"
- [ ] Abrir DevTools → Network → WS
- [ ] Verificar conexión a `wss://9bymcj94u7.execute-api.us-east-1.amazonaws.com/dev`

#### Recepción de Notificaciones
Simular desde backend o esperar eventos reales:
- [ ] ORDER_STATUS_UPDATE → "Tu orden cambió a [estado]"
- [ ] DRIVER_ASSIGNED → "Repartidor asignado: [nombre]"
- [ ] DRIVER_LOCATION_UPDATE → Actualizar mapa
- [ ] ORDER_DELIVERED → "Tu orden ha sido entregada"

#### Reconexión Automática
- [ ] Estar logueado con WebSocket conectado
- [ ] Apagar WiFi por 10 segundos
- [ ] Encender WiFi
- [ ] Verificar que WebSocket se reconecta automáticamente
- [ ] Ver en consola intentos de reconexión (máx 5)

### 8. 🔄 Auto-Refresh de JWT

#### Token Expirado (24h)
- [ ] Modificar token en localStorage para que esté expirado
- [ ] Hacer una petición autenticada (ej: ver órdenes)
- [ ] Verificar que recibe 401
- [ ] Verificar auto-refresh: llamada a POST `/auth/refresh`
- [ ] Ver nuevo token en localStorage
- [ ] Petición original se reintenta automáticamente

## 🐛 Debugging

### Verificar Endpoints en DevTools

#### Network Tab:
```
GET  https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/menu
GET  https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/menu/category/BEBIDAS
GET  https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/menu/search/hamburguesa
POST https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/auth/login
POST https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/cart/sync
```

#### Console Tab (Mensajes esperados):
```
📦 CartProvider: Loading cart from localStorage
🔄 User logged in, syncing cart with server
✅ Cart synced with server
🔌 WebSocket connected
🛒 Adding to cart: [producto]
💾 Saving cart to localStorage
```

#### WebSocket Tab:
```
wss://9bymcj94u7.execute-api.us-east-1.amazonaws.com/dev
Status: Connected
Messages: [eventos en tiempo real]
```

### Verificar LocalStorage

Abrir DevTools → Application → Local Storage:
```javascript
fridays_cart: [...] // Productos del carrito
fridays_auth_token: "eyJ..." // JWT token
fridays_refresh_token: "eyJ..." // Refresh token
```

## 🔍 Testing Manual Completo

### Flujo Completo (Happy Path):
1. ✅ Abrir http://localhost:5173
2. ✅ Navegar a /menu (sin login)
3. ✅ Buscar "pollo" → Ver resultados
4. ✅ Filtrar por "Comida" → Ver solo comidas
5. ✅ Agregar 3 productos al carrito
6. ✅ Ir a /register
7. ✅ Registrarse como cliente
8. ✅ Verificar WebSocket conectado (DevTools)
9. ✅ Ver carrito sincronizado con backend
10. ✅ Ir a checkout (pendiente de implementar)
11. ✅ Crear orden
12. ✅ Confirmar pago (95% éxito)
13. ✅ Ver orden en estado PAID
14. ✅ Esperar cambio de estado → IN_TRANSIT
15. ✅ Recibir notificación WebSocket
16. ✅ Ver tracking con ubicación del repartidor
17. ✅ Orden cambia a DELIVERED
18. ✅ Recibir notificación final
19. ✅ Logout → WebSocket se desconecta

## 📊 Métricas de Éxito

### Performance:
- [ ] Menú carga en < 2 segundos
- [ ] Búsqueda responde en < 500ms
- [ ] Cambio de categoría instantáneo (< 100ms local, < 1s backend)

### Funcionalidad:
- [ ] 100% de productos se muestran correctamente
- [ ] 0 errores en consola
- [ ] WebSocket se mantiene conectado
- [ ] Carrito sincroniza sin pérdida de datos

### UX:
- [ ] Transiciones suaves en hover
- [ ] Loading states visibles
- [ ] Mensajes de error claros
- [ ] Feedback inmediato en acciones

## 🚨 Problemas Comunes y Soluciones

### 1. "No se cargan los productos"
**Causa**: Backend no responde o CORS
**Solución**:
- Verificar que backend está desplegado
- Verificar URLs en `.env`
- Ver errores CORS en DevTools

### 2. "WebSocket no conecta"
**Causa**: URL incorrecta o token inválido
**Solución**:
- Verificar `VITE_WS_URL` en `.env`
- Logout y login de nuevo
- Ver errores en DevTools → Console

### 3. "Carrito no sincroniza"
**Causa**: Usuario no logueado o error de red
**Solución**:
- Verificar que usuario está logueado
- Ver Network tab → buscar `/cart/sync`
- Revisar console logs

### 4. "Token expired"
**Causa**: Token JWT expiró (24h)
**Solución**:
- El sistema debe auto-refresh automáticamente
- Si falla, logout y login de nuevo
- Verificar llamada a `/auth/refresh` en Network

## 📝 Notas de Testing

- **Menú es público**: Se puede probar sin login
- **Búsqueda y filtrado**: Funcionan sin backend si se implementa cache
- **WebSocket**: Requiere login para conectar
- **Carrito**: Funciona offline con localStorage, sync cuando hay login
- **Pagos**: 100% simulados, no requieren tarjeta real
- **Tracking**: Requiere orden en estado IN_TRANSIT

## 🎯 Próximos Tests (Cuando se implementen las páginas)

- [ ] Test de checkout completo
- [ ] Test de historial de órdenes
- [ ] Test de cancelación de orden
- [ ] Test de tracking en tiempo real con mapa
- [ ] Test de notificaciones toast/UI
- [ ] Test de performance con 100+ productos
- [ ] Test de manejo de errores de red
- [ ] Test de responsive design (móvil/tablet/desktop)
