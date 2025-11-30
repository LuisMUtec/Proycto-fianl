#!/bin/bash

# Script para completar lambdas faltantes según arquitectura Eraser.io
# Fridays Perú - Backend Completo

set -e

BASE_DIR="/home/nayeliguerrero/Descargas/VSCODE projects/Proycto-fianl/backend"
cd "$BASE_DIR"

echo "🚀 COMPLETANDO ARQUITECTURA FRIDAYS PERÚ"
echo "=========================================="
echo ""

# Función para crear lambda
create_lambda() {
    local service=$1
    local path=$2
    local filename=$3
    local handler_name=$4
    local description=$5
    
    local full_path="$BASE_DIR/services/${service}-service/functions/${path}"
    local file="$full_path/${filename}.js"
    
    mkdir -p "$full_path"
    
    if [ -f "$file" ]; then
        echo "  ⏭️  Ya existe: $filename"
        return
    fi
    
    cat > "$file" << 'EOF'
const { success, error, forbidden } = require('../../../../shared/utils/response');
const { getItem, putItem, query, scan, updateItem, deleteItem } = require('../../../../shared/database/dynamodb-client');
const { validateOwnership, validateTenantAccess } = require('../../../../shared/utils/validation');

/**
 * ${DESCRIPTION}
 */
exports.handler = async (event) => {
  try {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    // TODO: Implementar lógica de ${HANDLER_NAME}
    
    return success({ message: '${HANDLER_NAME} - Por implementar' });
    
  } catch (err) {
    console.error('Error:', err);
    return error(err.message || 'Error interno del servidor');
  }
};
EOF

    # Reemplazar placeholders
    sed -i "s/\${DESCRIPTION}/$description/g" "$file"
    sed -i "s/\${HANDLER_NAME}/$handler_name/g" "$file"
    
    echo "  ✅ Creado: $filename"
}

echo "📦 KITCHEN SERVICE (9 lambdas faltantes)"
echo "----------------------------------------"
create_lambda "kitchen" "orders" "createOrderInKitchen" "createOrderInKitchen" "POST /kitchen/orders - Crear orden en cocina (internal)"
create_lambda "kitchen" "orders" "listOrders" "listOrders" "GET /kitchen/orders - Listar todas las órdenes"
create_lambda "kitchen" "orders" "getOrder" "getOrder" "GET /kitchen/orders/{orderId} - Obtener orden específica"
create_lambda "kitchen" "orders" "putStatus" "putStatus" "PUT /kitchen/orders/{orderId}/status - Actualizar estado de orden"
create_lambda "kitchen" "chefs" "getChef" "getChef" "GET /kitchen/chefs/{chefId} - Obtener chef específico"
create_lambda "kitchen" "chefs" "updateChef" "updateChef" "PUT /kitchen/chefs/{chefId} - Actualizar chef"
create_lambda "kitchen" "chefs" "deleteChef" "deleteChef" "DELETE /kitchen/chefs/{chefId} - Eliminar chef"
create_lambda "kitchen" "chefs" "seedChefs" "seedChefs" "POST /kitchen/chefs/seed - Seed de chefs iniciales"

echo ""
echo "📦 DELIVERY SERVICE (7 lambdas faltantes)"
echo "----------------------------------------"
create_lambda "delivery" "orders" "createDeliveryRecord" "createDeliveryRecord" "POST /delivery/orders - Crear registro de delivery (internal)"
create_lambda "delivery" "orders" "getOrder" "getOrder" "GET /delivery/orders/{orderId} - Obtener orden de delivery"
create_lambda "delivery" "orders" "listOrders" "listOrders" "GET /delivery/orders - Listar órdenes de delivery"
create_lambda "delivery" "orders" "deleteOrder" "deleteOrder" "DELETE /delivery/orders/{orderId} - Eliminar orden de delivery"
create_lambda "delivery" "drivers" "getDriver" "getDriver" "GET /delivery/drivers/{driverId} - Obtener driver específico"
create_lambda "delivery" "drivers" "updateDriver" "updateDriver" "PUT /delivery/drivers/{driverId} - Actualizar driver"
create_lambda "delivery" "drivers" "deleteDriver" "deleteDriver" "DELETE /delivery/drivers/{driverId} - Eliminar driver"
create_lambda "delivery" "drivers" "seedDrivers" "seedDrivers" "POST /delivery/drivers/seed - Seed de drivers iniciales"

echo ""
echo "📦 ADMIN SERVICE (11 lambdas faltantes)"
echo "--------------------------------------"
create_lambda "admin" "sedes" "getSede" "getSede" "GET /admin/sedes/{sedeId} - Obtener sede específica"
create_lambda "admin" "sedes" "updateSede" "updateSede" "PUT /admin/sedes/{sedeId} - Actualizar sede"
create_lambda "admin" "sedes" "deleteSede" "deleteSede" "DELETE /admin/sedes/{sedeId} - Eliminar sede"
create_lambda "admin" "users" "getUser" "getUser" "GET /admin/users/{userId} - Obtener usuario específico"
create_lambda "admin" "users" "updateUser" "updateUser" "PUT /admin/users/{userId} - Actualizar usuario"
create_lambda "admin" "users" "deleteUser" "deleteUser" "DELETE /admin/users/{userId} - Eliminar usuario"
create_lambda "admin" "products" "listProducts" "listProducts" "GET /admin/products - Listar productos"
create_lambda "admin" "products" "getProduct" "getProduct" "GET /admin/products/{productId} - Obtener producto"
create_lambda "admin" "metrics" "kitchenMetrics" "kitchenMetrics" "GET /admin/kitchen/metrics - Métricas de cocina"
create_lambda "admin" "finances" "financesDaily" "financesDaily" "GET /admin/finances/daily - Finanzas diarias"
create_lambda "admin" "finances" "financesMonthly" "financesMonthly" "GET /admin/finances/monthly - Finanzas mensuales"

echo ""
echo "📦 E-COMMERCE SERVICE (4 lambdas faltantes)"
echo "------------------------------------------"
create_lambda "ecommerce" "products-admin" "listProducts" "adminListProducts" "GET /menu/productos - Admin list products"
create_lambda "ecommerce" "products-admin" "getProduct" "adminGetProduct" "GET /menu/productos/{productId} - Admin get product"
create_lambda "ecommerce" "orders" "updateOrder" "updateOrder" "PUT /orders/{orderId} - Admin update order"
create_lambda "ecommerce" "orders" "deleteOrder" "deleteOrder" "DELETE /orders/{orderId} - Admin delete order"

echo ""
echo "📦 WEBSOCKET SERVICE (4 lambdas faltantes)"
echo "-----------------------------------------"
create_lambda "websocket" "messages" "sendMessage" "sendMessage" "POST /ws/notify - Enviar mensaje por WebSocket"
create_lambda "websocket" "connections" "getAllConnections" "connCRUD_getAll" "GET /ws/connections - Listar todas las conexiones"
create_lambda "websocket" "connections" "getConnection" "connCRUD_get" "GET /ws/connections/{connectionId} - Obtener conexión específica"
create_lambda "websocket" "connections" "deleteConnection" "connCRUD_delete" "DELETE /ws/connections/{connectionId} - Eliminar conexión"

echo ""
echo "✅ LAMBDAS CREADAS EXITOSAMENTE"
echo ""
echo "📊 RESUMEN:"
echo "  ✅ KITCHEN: +9 lambdas"
echo "  ✅ DELIVERY: +7 lambdas"
echo "  ✅ ADMIN: +11 lambdas"
echo "  ✅ E-COMMERCE: +4 lambdas"
echo "  ✅ WEBSOCKET: +4 lambdas"
echo "  ━━━━━━━━━━━━━━━━━━━━"
echo "  📈 TOTAL: +35 lambdas"
echo ""
echo "🎯 SIGUIENTE PASO: Actualizar serverless.yml con las nuevas funciones"
