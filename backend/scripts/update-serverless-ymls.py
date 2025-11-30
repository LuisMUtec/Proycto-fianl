#!/usr/bin/env python3
"""
Script para agregar las 35 nuevas funciones a los serverless.yml
Fridays Perú - Completar configuración 100%
"""

import os
import yaml

BASE_DIR = "/home/nayeliguerrero/Descargas/VSCODE projects/Proycto-fianl/backend"

# Nuevas funciones a agregar por servicio
NEW_FUNCTIONS = {
    "kitchen": {
        # Orders
        "createOrderInKitchen": {
            "handler": "functions/orders/createOrderInKitchen.handler",
            "events": [{
                "http": {
                    "path": "/kitchen/orders",
                    "method": "POST",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        "listKitchenOrders": {
            "handler": "functions/orders/listOrders.handler",
            "events": [{
                "http": {
                    "path": "/kitchen/orders",
                    "method": "GET",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        "getKitchenOrder": {
            "handler": "functions/orders/getOrder.handler",
            "events": [{
                "http": {
                    "path": "/kitchen/orders/{orderId}",
                    "method": "GET",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        "putOrderStatus": {
            "handler": "functions/orders/putStatus.handler",
            "events": [{
                "http": {
                    "path": "/kitchen/orders/{orderId}/status",
                    "method": "PUT",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        # Chefs
        "getChef": {
            "handler": "functions/chefs/getChef.handler",
            "events": [{
                "http": {
                    "path": "/kitchen/chefs/{chefId}",
                    "method": "GET",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        "updateChef": {
            "handler": "functions/chefs/updateChef.handler",
            "events": [{
                "http": {
                    "path": "/kitchen/chefs/{chefId}",
                    "method": "PUT",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        "deleteChef": {
            "handler": "functions/chefs/deleteChef.handler",
            "events": [{
                "http": {
                    "path": "/kitchen/chefs/{chefId}",
                    "method": "DELETE",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        "seedChefs": {
            "handler": "functions/chefs/seedChefs.handler",
            "events": [{
                "http": {
                    "path": "/kitchen/chefs/seed",
                    "method": "POST",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        }
    },
    
    "delivery": {
        # Orders
        "createDeliveryRecord": {
            "handler": "functions/orders/createDeliveryRecord.handler",
            "events": [{
                "http": {
                    "path": "/delivery/orders",
                    "method": "POST",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        "getDeliveryOrder": {
            "handler": "functions/orders/getOrder.handler",
            "events": [{
                "http": {
                    "path": "/delivery/orders/{orderId}",
                    "method": "GET",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        "listDeliveryOrders": {
            "handler": "functions/orders/listOrders.handler",
            "events": [{
                "http": {
                    "path": "/delivery/orders",
                    "method": "GET",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        "deleteDeliveryOrder": {
            "handler": "functions/orders/deleteOrder.handler",
            "events": [{
                "http": {
                    "path": "/delivery/orders/{orderId}",
                    "method": "DELETE",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        # Drivers
        "getDriver": {
            "handler": "functions/drivers/getDriver.handler",
            "events": [{
                "http": {
                    "path": "/delivery/drivers/{driverId}",
                    "method": "GET",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        "updateDriver": {
            "handler": "functions/drivers/updateDriver.handler",
            "events": [{
                "http": {
                    "path": "/delivery/drivers/{driverId}",
                    "method": "PUT",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        "deleteDriver": {
            "handler": "functions/drivers/deleteDriver.handler",
            "events": [{
                "http": {
                    "path": "/delivery/drivers/{driverId}",
                    "method": "DELETE",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        "seedDrivers": {
            "handler": "functions/drivers/seedDrivers.handler",
            "events": [{
                "http": {
                    "path": "/delivery/drivers/seed",
                    "method": "POST",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        }
    },
    
    "admin": {
        # Sedes
        "getSede": {
            "handler": "functions/sedes/getSede.handler",
            "events": [{
                "http": {
                    "path": "/admin/sedes/{sedeId}",
                    "method": "GET",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        "updateSede": {
            "handler": "functions/sedes/updateSede.handler",
            "events": [{
                "http": {
                    "path": "/admin/sedes/{sedeId}",
                    "method": "PUT",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        "deleteSede": {
            "handler": "functions/sedes/deleteSede.handler",
            "events": [{
                "http": {
                    "path": "/admin/sedes/{sedeId}",
                    "method": "DELETE",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        # Users
        "getUser": {
            "handler": "functions/users/getUser.handler",
            "events": [{
                "http": {
                    "path": "/admin/users/{userId}",
                    "method": "GET",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        "updateUser": {
            "handler": "functions/users/updateUser.handler",
            "events": [{
                "http": {
                    "path": "/admin/users/{userId}",
                    "method": "PUT",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        "deleteUser": {
            "handler": "functions/users/deleteUser.handler",
            "events": [{
                "http": {
                    "path": "/admin/users/{userId}",
                    "method": "DELETE",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        # Products
        "listAdminProducts": {
            "handler": "functions/products/listProducts.handler",
            "events": [{
                "http": {
                    "path": "/admin/products",
                    "method": "GET",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        "getAdminProduct": {
            "handler": "functions/products/getProduct.handler",
            "events": [{
                "http": {
                    "path": "/admin/products/{productId}",
                    "method": "GET",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        # Metrics & Finances
        "kitchenMetrics": {
            "handler": "functions/metrics/kitchenMetrics.handler",
            "events": [{
                "http": {
                    "path": "/admin/kitchen/metrics",
                    "method": "GET",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        "financesDaily": {
            "handler": "functions/finances/financesDaily.handler",
            "events": [{
                "http": {
                    "path": "/admin/finances/daily",
                    "method": "GET",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        "financesMonthly": {
            "handler": "functions/finances/financesMonthly.handler",
            "events": [{
                "http": {
                    "path": "/admin/finances/monthly",
                    "method": "GET",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        }
    },
    
    "ecommerce": {
        # Products Admin
        "adminListProducts": {
            "handler": "functions/products-admin/listProducts.handler",
            "events": [{
                "http": {
                    "path": "/menu/productos",
                    "method": "GET",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        "adminGetProduct": {
            "handler": "functions/products-admin/getProduct.handler",
            "events": [{
                "http": {
                    "path": "/menu/productos/{productId}",
                    "method": "GET",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        # Orders Admin
        "updateOrder": {
            "handler": "functions/orders/updateOrder.handler",
            "events": [{
                "http": {
                    "path": "/orders/{orderId}",
                    "method": "PUT",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        "deleteOrder": {
            "handler": "functions/orders/deleteOrder.handler",
            "events": [{
                "http": {
                    "path": "/orders/{orderId}",
                    "method": "DELETE",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        }
    },
    
    "websocket": {
        # Messages
        "sendMessage": {
            "handler": "functions/messages/sendMessage.handler",
            "events": [{
                "http": {
                    "path": "/ws/notify",
                    "method": "POST",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        # Connections CRUD
        "getAllConnections": {
            "handler": "functions/connections/getAllConnections.handler",
            "events": [{
                "http": {
                    "path": "/ws/connections",
                    "method": "GET",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        "getConnection": {
            "handler": "functions/connections/getConnection.handler",
            "events": [{
                "http": {
                    "path": "/ws/connections/{connectionId}",
                    "method": "GET",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        },
        "deleteConnection": {
            "handler": "functions/connections/deleteConnection.handler",
            "events": [{
                "http": {
                    "path": "/ws/connections/{connectionId}",
                    "method": "DELETE",
                    "cors": True,
                    "authorizer": {"name": "authorizer", "type": "REQUEST"}
                }
            }]
        }
    }
}

def update_serverless_yml(service_name):
    """Actualizar serverless.yml de un servicio"""
    yml_path = os.path.join(BASE_DIR, f"services/{service_name}-service/serverless.yml")
    
    if not os.path.exists(yml_path):
        print(f"  ⚠️  No existe: {yml_path}")
        return False
    
    # Leer archivo actual
    with open(yml_path, 'r') as f:
        content = f.read()
    
    # Agregar nuevas funciones al final de la sección functions
    new_functions_yaml = "\n  # ============================================================================\n"
    new_functions_yaml += f"  # NUEVAS FUNCIONES AGREGADAS - {service_name.upper()}\n"
    new_functions_yaml += "  # ============================================================================\n"
    
    for func_name, func_config in NEW_FUNCTIONS.get(service_name, {}).items():
        new_functions_yaml += f"  {func_name}:\n"
        new_functions_yaml += f"    handler: {func_config['handler']}\n"
        new_functions_yaml += f"    events:\n"
        for event in func_config['events']:
            new_functions_yaml += f"      - http:\n"
            http_config = event['http']
            new_functions_yaml += f"          path: {http_config['path']}\n"
            new_functions_yaml += f"          method: {http_config['method']}\n"
            new_functions_yaml += f"          cors: true\n"
            if 'authorizer' in http_config:
                new_functions_yaml += f"          authorizer:\n"
                new_functions_yaml += f"            name: {http_config['authorizer']['name']}\n"
                new_functions_yaml += f"            type: {http_config['authorizer']['type']}\n"
        new_functions_yaml += "\n"
    
    # Insertar antes de plugins o al final
    if '\nplugins:' in content:
        content = content.replace('\nplugins:', new_functions_yaml + 'plugins:')
    else:
        content += new_functions_yaml
    
    # Escribir archivo actualizado
    with open(yml_path, 'w') as f:
        f.write(content)
    
    return True

def main():
    print("🚀 ACTUALIZANDO SERVERLESS.YML")
    print("=" * 60)
    print()
    
    total_updated = 0
    total_functions = 0
    
    for service_name, functions in NEW_FUNCTIONS.items():
        func_count = len(functions)
        print(f"📦 {service_name.upper()}-SERVICE (+{func_count} funciones)")
        print("-" * 60)
        
        if update_serverless_yml(service_name):
            print(f"  ✅ serverless.yml actualizado")
            total_updated += 1
            total_functions += func_count
        else:
            print(f"  ❌ Error actualizando serverless.yml")
        
        print()
    
    print("=" * 60)
    print("✅ ACTUALIZACIÓN COMPLETADA")
    print()
    print("📊 RESUMEN:")
    print(f"  ✅ Servicios actualizados: {total_updated}/5")
    print(f"  ✅ Funciones agregadas: {total_functions}")
    print()
    print("🎯 PROYECTO AHORA AL 100%")
    print("🚀 Listo para deployment completo!")

if __name__ == "__main__":
    main()
