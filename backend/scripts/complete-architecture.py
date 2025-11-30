#!/usr/bin/env python3
"""
Script para completar todas las lambdas faltantes según arquitectura Eraser.io
Fridays Perú - Backend Completo
"""

import os
import json

BASE_DIR = "/home/nayeliguerrero/Descargas/VSCODE projects/Proycto-fianl/backend"

# Plantilla de lambda
LAMBDA_TEMPLATE = """const {{ success, error, forbidden }} = require('../../../../shared/utils/response');
const {{ getItem, putItem, query, scan, updateItem, deleteItem }} = require('../../../../shared/database/dynamodb-client');
const {{ validateOwnership, validateTenantAccess }} = require('../../../../shared/utils/validation');

/**
 * {description}
 */
exports.handler = async (event) => {{
  try {{
    console.log('Event:', JSON.stringify(event, null, 2));
    
    // TODO: Implementar lógica de {handler_name}
    
    return success({{ message: '{handler_name} - Por implementar' }});
    
  }} catch (err) {{
    console.error('Error:', err);
    return error(err.message || 'Error interno del servidor');
  }}
}};
"""

# Definición de todas las lambdas faltantes
LAMBDAS_TO_CREATE = {
    "kitchen": {
        "orders": [
            ("createOrderInKitchen", "POST /kitchen/orders - Crear orden en cocina (internal)"),
            ("listOrders", "GET /kitchen/orders - Listar todas las órdenes"),
            ("getOrder", "GET /kitchen/orders/{{orderId}} - Obtener orden específica"),
            ("putStatus", "PUT /kitchen/orders/{{orderId}}/status - Actualizar estado de orden"),
        ],
        "chefs": [
            ("getChef", "GET /kitchen/chefs/{{chefId}} - Obtener chef específico"),
            ("updateChef", "PUT /kitchen/chefs/{{chefId}} - Actualizar chef"),
            ("deleteChef", "DELETE /kitchen/chefs/{{chefId}} - Eliminar chef"),
            ("seedChefs", "POST /kitchen/chefs/seed - Seed de chefs iniciales"),
        ]
    },
    "delivery": {
        "orders": [
            ("createDeliveryRecord", "POST /delivery/orders - Crear registro de delivery (internal)"),
            ("getOrder", "GET /delivery/orders/{{orderId}} - Obtener orden de delivery"),
            ("listOrders", "GET /delivery/orders - Listar órdenes de delivery"),
            ("deleteOrder", "DELETE /delivery/orders/{{orderId}} - Eliminar orden de delivery"),
        ],
        "drivers": [
            ("getDriver", "GET /delivery/drivers/{{driverId}} - Obtener driver específico"),
            ("updateDriver", "PUT /delivery/drivers/{{driverId}} - Actualizar driver"),
            ("deleteDriver", "DELETE /delivery/drivers/{{driverId}} - Eliminar driver"),
            ("seedDrivers", "POST /delivery/drivers/seed - Seed de drivers iniciales"),
        ]
    },
    "admin": {
        "sedes": [
            ("getSede", "GET /admin/sedes/{{sedeId}} - Obtener sede específica"),
            ("updateSede", "PUT /admin/sedes/{{sedeId}} - Actualizar sede"),
            ("deleteSede", "DELETE /admin/sedes/{{sedeId}} - Eliminar sede"),
        ],
        "users": [
            ("getUser", "GET /admin/users/{{userId}} - Obtener usuario específico"),
            ("updateUser", "PUT /admin/users/{{userId}} - Actualizar usuario"),
            ("deleteUser", "DELETE /admin/users/{{userId}} - Eliminar usuario"),
        ],
        "products": [
            ("listProducts", "GET /admin/products - Listar productos"),
            ("getProduct", "GET /admin/products/{{productId}} - Obtener producto"),
        ],
        "metrics": [
            ("kitchenMetrics", "GET /admin/kitchen/metrics - Métricas de cocina"),
        ],
        "finances": [
            ("financesDaily", "GET /admin/finances/daily - Finanzas diarias"),
            ("financesMonthly", "GET /admin/finances/monthly - Finanzas mensuales"),
        ]
    },
    "ecommerce": {
        "products-admin": [
            ("listProducts", "GET /menu/productos - Admin list products"),
            ("getProduct", "GET /menu/productos/{{productId}} - Admin get product"),
        ],
        "orders": [
            ("updateOrder", "PUT /orders/{{orderId}} - Admin update order"),
            ("deleteOrder", "DELETE /orders/{{orderId}} - Admin delete order"),
        ]
    },
    "websocket": {
        "messages": [
            ("sendMessage", "POST /ws/notify - Enviar mensaje por WebSocket"),
        ],
        "connections": [
            ("getAllConnections", "GET /ws/connections - Listar todas las conexiones"),
            ("getConnection", "GET /ws/connections/{{connectionId}} - Obtener conexión específica"),
            ("deleteConnection", "DELETE /ws/connections/{{connectionId}} - Eliminar conexión"),
        ]
    }
}

def create_lambda(service, path, filename, description):
    """Crear archivo lambda"""
    full_path = os.path.join(BASE_DIR, f"services/{service}-service/functions/{path}")
    os.makedirs(full_path, exist_ok=True)
    
    file_path = os.path.join(full_path, f"{filename}.js")
    
    if os.path.exists(file_path):
        print(f"  ⏭️  Ya existe: {filename}")
        return False
    
    content = LAMBDA_TEMPLATE.format(
        description=description,
        handler_name=filename
    )
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    print(f"  ✅ Creado: {filename}")
    return True

def main():
    print("🚀 COMPLETANDO ARQUITECTURA FRIDAYS PERÚ")
    print("=" * 50)
    print()
    
    total_created = 0
    total_skipped = 0
    
    for service, paths in LAMBDAS_TO_CREATE.items():
        service_name = service.upper()
        lambdas_count = sum(len(lambdas) for lambdas in paths.values())
        print(f"📦 {service_name} SERVICE ({lambdas_count} lambdas)")
        print("-" * 50)
        
        for path, lambdas in paths.items():
            for filename, description in lambdas:
                if create_lambda(service, path, filename, description):
                    total_created += 1
                else:
                    total_skipped += 1
        print()
    
    print("✅ PROCESO COMPLETADO")
    print()
    print("📊 RESUMEN:")
    print(f"  ✅ Lambdas creadas: {total_created}")
    print(f"  ⏭️  Lambdas existentes: {total_skipped}")
    print(f"  📈 Total procesadas: {total_created + total_skipped}")
    print()
    print("🎯 SIGUIENTE PASO: Actualizar serverless.yml con las nuevas funciones")

if __name__ == "__main__":
    main()
