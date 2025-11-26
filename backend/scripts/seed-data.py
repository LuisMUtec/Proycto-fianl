"""
Script para poblar las tablas de DynamoDB con datos de prueba
Incluye productos, usuarios con todos los roles, y sedes

Requisitos:
- AWS CLI configurado con credenciales
- Tablas DynamoDB ya creadas (ejecutar serverless deploy primero)
- Python 3.11+

Uso:
    python seed-data.py --stage dev --region us-east-1
"""

import boto3
import json
import hashlib
from datetime import datetime, timezone
from decimal import Decimal
import argparse
import sys

# Configuración
USERS_TABLE = "fridays-backend-users-{stage}"
PRODUCTS_TABLE = "fridays-backend-products-{stage}"
SEDES_TABLE = "fridays-backend-sedes-{stage}"

def hash_password(password: str) -> str:
    """Hash password usando SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def get_current_iso():
    """Retorna timestamp ISO 8601 actual"""
    return datetime.now(timezone.utc).isoformat()

def seed_users(dynamodb, table_name, tenant_id):
    """
    Poblar tabla de usuarios con todos los roles
    Passwords: todos123 (fácil de recordar para testing)
    """
    table = dynamodb.Table(table_name)
    hashed_password = hash_password("todos123")
    timestamp = get_current_iso()
    
    users = [
        {
            "userId": "user-001",
            "email": "cliente@fridays.com",
            "passwordHash": hashed_password,
            "firstName": "Juan",
            "lastName": "Cliente",
            "role": "USER",
            "status": "ACTIVE",
            "tenantId": tenant_id,
            "phone": "+593987654321",
            "address": "Av. República 123, Quito",
            "createdAt": timestamp,
            "updatedAt": timestamp
        },
        {
            "userId": "cook-001",
            "email": "chef@fridays.com",
            "passwordHash": hashed_password,
            "firstName": "María",
            "lastName": "Chef",
            "role": "COOK",
            "status": "ACTIVE",
            "tenantId": tenant_id,
            "phone": "+593987654322",
            "createdAt": timestamp,
            "updatedAt": timestamp
        },
        {
            "userId": "dispatcher-001",
            "email": "delivery@fridays.com",
            "passwordHash": hashed_password,
            "firstName": "Carlos",
            "lastName": "Delivery",
            "role": "DISPATCHER",
            "status": "ACTIVE",
            "tenantId": tenant_id,
            "phone": "+593987654323",
            "vehicleType": "MOTORCYCLE",
            "licensePlate": "ABC-1234",
            "createdAt": timestamp,
            "updatedAt": timestamp
        },
        {
            "userId": "admin-001",
            "email": "admin@fridays.com",
            "passwordHash": hashed_password,
            "firstName": "Ana",
            "lastName": "Admin",
            "role": "ADMIN",
            "status": "ACTIVE",
            "tenantId": tenant_id,
            "phone": "+593987654324",
            "createdAt": timestamp,
            "updatedAt": timestamp
        },
        {
            "userId": "cook-002",
            "email": "chef2@fridays.com",
            "passwordHash": hashed_password,
            "firstName": "Pedro",
            "lastName": "Cocinero",
            "role": "COOK",
            "status": "ACTIVE",
            "tenantId": tenant_id,
            "phone": "+593987654325",
            "createdAt": timestamp,
            "updatedAt": timestamp
        },
        {
            "userId": "user-002",
            "email": "cliente2@fridays.com",
            "passwordHash": hashed_password,
            "firstName": "Laura",
            "lastName": "Pérez",
            "role": "USER",
            "status": "ACTIVE",
            "tenantId": tenant_id,
            "phone": "+593987654326",
            "address": "Av. Amazonas N24-03, Quito",
            "createdAt": timestamp,
            "updatedAt": timestamp
        }
    ]
    
    print(f"\n📝 Poblando tabla {table_name} con {len(users)} usuarios...")
    print("🔑 Password para todos los usuarios: todos123\n")
    
    for user in users:
        try:
            table.put_item(Item=user)
            role_emoji = {"USER": "👤", "COOK": "👨‍🍳", "DISPATCHER": "🚗", "ADMIN": "👔"}
            full_name = f"{user['firstName']} {user['lastName']}"
            print(f"  {role_emoji.get(user['role'], '•')} {user['role']:12} | {user['email']:25} | {full_name}")
        except Exception as e:
            print(f"❌ Error insertando {user['email']}: {e}")
    
    print("✅ Usuarios creados exitosamente\n")

def seed_products(dynamodb, table_name, tenant_id):
    """Poblar tabla de productos con menú variado"""
    table = dynamodb.Table(table_name)
    timestamp = get_current_iso()
    
    products = [
        # FOOD
        {
            "productId": "prod-001",
            "tenantId": tenant_id,
            "name": "Jack Daniel's Burger",
            "description": "Hamburguesa con salsa Jack Daniel's, queso cheddar, bacon y aros de cebolla",
            "category": "FOOD",
            "price": Decimal("12.99"),
            "preparationTime": 15,
            "isAvailable": True,
            "imageUrl": "https://example.com/images/jack-daniels-burger.jpg",
            "ingredients": ["Carne de res", "Pan brioche", "Queso cheddar", "Bacon", "Salsa Jack Daniel's", "Aros de cebolla"],
            "createdAt": timestamp,
            "updatedAt": timestamp
        },
        {
            "productId": "prod-002",
            "tenantId": tenant_id,
            "name": "Costillas BBQ",
            "description": "Costillas de cerdo glaseadas con salsa BBQ, acompañadas de papas fritas",
            "category": "FOOD",
            "price": Decimal("18.50"),
            "preparationTime": 25,
            "isAvailable": True,
            "imageUrl": "https://example.com/images/bbq-ribs.jpg",
            "ingredients": ["Costillas de cerdo", "Salsa BBQ", "Papas fritas", "Ensalada de col"],
            "createdAt": timestamp,
            "updatedAt": timestamp
        },
        {
            "productId": "prod-003",
            "tenantId": tenant_id,
            "name": "Alitas Picantes",
            "description": "12 alitas de pollo con salsa buffalo, acompañadas de aderezo ranch",
            "category": "FOOD",
            "price": Decimal("10.99"),
            "preparationTime": 12,
            "isAvailable": True,
            "imageUrl": "https://example.com/images/buffalo-wings.jpg",
            "ingredients": ["Alitas de pollo", "Salsa buffalo", "Aderezo ranch", "Apio"],
            "createdAt": timestamp,
            "updatedAt": timestamp
        },
        {
            "productId": "prod-004",
            "tenantId": tenant_id,
            "name": "Caesar Salad",
            "description": "Ensalada césar con pollo a la parrilla, crutones y queso parmesano",
            "category": "FOOD",
            "price": Decimal("9.99"),
            "preparationTime": 8,
            "isAvailable": True,
            "imageUrl": "https://example.com/images/caesar-salad.jpg",
            "ingredients": ["Lechuga romana", "Pollo", "Crutones", "Queso parmesano", "Aderezo césar"],
            "createdAt": timestamp,
            "updatedAt": timestamp
        },
        # DRINKS
        {
            "productId": "prod-005",
            "tenantId": tenant_id,
            "name": "Margarita Clásica",
            "description": "Tequila, triple sec, jugo de limón y sal en el borde",
            "category": "DRINK",
            "price": Decimal("7.50"),
            "preparationTime": 3,
            "isAvailable": True,
            "imageUrl": "https://example.com/images/margarita.jpg",
            "ingredients": ["Tequila", "Triple sec", "Jugo de limón", "Sal", "Hielo"],
            "createdAt": timestamp,
            "updatedAt": timestamp
        },
        {
            "productId": "prod-006",
            "tenantId": tenant_id,
            "name": "Limonada Natural",
            "description": "Limonada fresca preparada al momento",
            "category": "DRINK",
            "price": Decimal("3.50"),
            "preparationTime": 2,
            "isAvailable": True,
            "imageUrl": "https://example.com/images/lemonade.jpg",
            "ingredients": ["Limones", "Azúcar", "Agua", "Hielo", "Menta"],
            "createdAt": timestamp,
            "updatedAt": timestamp
        },
        {
            "productId": "prod-007",
            "tenantId": tenant_id,
            "name": "Cerveza Corona",
            "description": "Cerveza mexicana 355ml, servida con limón",
            "category": "DRINK",
            "price": Decimal("4.00"),
            "preparationTime": 1,
            "isAvailable": True,
            "imageUrl": "https://example.com/images/corona.jpg",
            "ingredients": ["Cerveza Corona", "Limón"],
            "createdAt": timestamp,
            "updatedAt": timestamp
        },
        # DESSERTS
        {
            "productId": "prod-008",
            "tenantId": tenant_id,
            "name": "Brownie con Helado",
            "description": "Brownie de chocolate caliente con helado de vainilla y salsa de chocolate",
            "category": "DESSERT",
            "price": Decimal("6.99"),
            "preparationTime": 5,
            "isAvailable": True,
            "imageUrl": "https://example.com/images/brownie.jpg",
            "ingredients": ["Brownie", "Helado de vainilla", "Salsa de chocolate", "Nueces"],
            "createdAt": timestamp,
            "updatedAt": timestamp
        },
        {
            "productId": "prod-009",
            "tenantId": tenant_id,
            "name": "Cheesecake de Fresa",
            "description": "Cheesecake cremoso con topping de fresas frescas",
            "category": "DESSERT",
            "price": Decimal("5.99"),
            "preparationTime": 3,
            "isAvailable": True,
            "imageUrl": "https://example.com/images/cheesecake.jpg",
            "ingredients": ["Queso crema", "Galletas", "Fresas", "Crema"],
            "createdAt": timestamp,
            "updatedAt": timestamp
        },
        # COMBOS
        {
            "productId": "prod-010",
            "tenantId": tenant_id,
            "name": "Combo Familiar",
            "description": "2 hamburguesas, 12 alitas, papas grandes y 4 bebidas",
            "category": "COMBO",
            "price": Decimal("39.99"),
            "preparationTime": 20,
            "isAvailable": True,
            "imageUrl": "https://example.com/images/family-combo.jpg",
            "ingredients": ["Hamburguesas", "Alitas", "Papas fritas", "Bebidas"],
            "createdAt": timestamp,
            "updatedAt": timestamp
        }
    ]
    
    print(f"🍔 Poblando tabla {table_name} con {len(products)} productos...")
    
    category_count = {"FOOD": 0, "DRINK": 0, "DESSERT": 0, "COMBO": 0}
    for product in products:
        try:
            table.put_item(Item=product)
            category_count[product["category"]] += 1
            emoji = {"FOOD": "🍔", "DRINK": "🍹", "DESSERT": "🍰", "COMBO": "📦"}
            print(f"  {emoji[product['category']]} {product['category']:8} | ${float(product['price']):6.2f} | {product['name']}")
        except Exception as e:
            print(f"❌ Error insertando {product['name']}: {e}")
    
    print(f"\n✅ Productos creados: {category_count['FOOD']} comidas, {category_count['DRINK']} bebidas, {category_count['DESSERT']} postres, {category_count['COMBO']} combos\n")

def seed_sedes(dynamodb, table_name):
    """Poblar tabla de sedes (restaurantes)"""
    table = dynamodb.Table(table_name)
    timestamp = get_current_iso()
    
    sedes = [
        {
            "tenantId": "sede-miraflores-001",
            "name": "TGI Friday's Miraflores",
            "address": "Av. Larco 1301, Miraflores",
            "city": "Lima",
            "district": "Miraflores",
            "country": "Perú",
            "phone": "+5114451234",
            "email": "miraflores@fridays.pe",
            "coordinates": {
                "lat": Decimal("-12.1219"),
                "lng": Decimal("-77.0292")
            },
            "openingHours": {
                "monday": "11:00-23:00",
                "tuesday": "11:00-23:00",
                "wednesday": "11:00-23:00",
                "thursday": "11:00-23:00",
                "friday": "11:00-01:00",
                "saturday": "11:00-01:00",
                "sunday": "11:00-22:00"
            },
            "active": True,
            "createdAt": timestamp,
            "updatedAt": timestamp
        },
        {
            "tenantId": "sede-sanisidro-001",
            "name": "TGI Friday's San Isidro",
            "address": "Av. Conquistadores 968, San Isidro",
            "city": "Lima",
            "district": "San Isidro",
            "country": "Perú",
            "phone": "+5114225678",
            "email": "sanisidro@fridays.pe",
            "coordinates": {
                "lat": Decimal("-12.0964"),
                "lng": Decimal("-77.0375")
            },
            "openingHours": {
                "monday": "11:00-23:00",
                "tuesday": "11:00-23:00",
                "wednesday": "11:00-23:00",
                "thursday": "11:00-23:00",
                "friday": "11:00-01:00",
                "saturday": "11:00-01:00",
                "sunday": "11:00-22:00"
            },
            "active": True,
            "createdAt": timestamp,
            "updatedAt": timestamp
        },
        {
            "tenantId": "sede-surco-001",
            "name": "TGI Friday's Surco",
            "address": "Av. Primavera 2680, Surco",
            "city": "Lima",
            "district": "Surco",
            "country": "Perú",
            "phone": "+5113449012",
            "email": "surco@fridays.pe",
            "coordinates": {
                "lat": Decimal("-12.1391"),
                "lng": Decimal("-76.9897")
            },
            "openingHours": {
                "monday": "11:00-23:00",
                "tuesday": "11:00-23:00",
                "wednesday": "11:00-23:00",
                "thursday": "11:00-23:00",
                "friday": "11:00-01:00",
                "saturday": "11:00-01:00",
                "sunday": "11:00-22:00"
            },
            "active": True,
            "createdAt": timestamp,
            "updatedAt": timestamp
        }
    ]
    
    print(f"🏢 Poblando tabla {table_name} con {len(sedes)} sedes...")
    
    for sede in sedes:
        try:
            table.put_item(Item=sede)
            print(f"  📍 {sede['district']:12} | {sede['name']}")
        except Exception as e:
            print(f"❌ Error insertando sede {sede['name']}: {e}")
    
    print("✅ Sedes creadas exitosamente\n")
    
    return sedes[0]["tenantId"]  # Retornar tenantId de la primera sede para usar en otros seeds

def main():
    parser = argparse.ArgumentParser(description="Poblar tablas DynamoDB con datos de prueba")
    parser.add_argument("--stage", default="dev", help="Stage del deployment (dev, prod, etc)")
    parser.add_argument("--region", default="us-east-1", help="Región de AWS")
    
    args = parser.parse_args()
    
    print("=" * 80)
    print("🌱 SCRIPT DE POBLACIÓN DE DATOS - TGI FRIDAYS")
    print("=" * 80)
    print(f"Stage: {args.stage}")
    print(f"Region: {args.region}")
    print("=" * 80)
    
    try:
        # Inicializar cliente DynamoDB
        dynamodb = boto3.resource('dynamodb', region_name=args.region)
        
        # Nombres de tablas con stage
        users_table = USERS_TABLE.format(stage=args.stage)
        products_table = PRODUCTS_TABLE.format(stage=args.stage)
        sedes_table = SEDES_TABLE.format(stage=args.stage)
        
        # Poblar sedes primero (necesitamos el tenantId)
        tenant_id = seed_sedes(dynamodb, sedes_table)
        
        # Poblar productos usando el tenantId de la primera sede
        seed_products(dynamodb, products_table, tenant_id)
        
        # Poblar usuarios usando el mismo tenantId
        seed_users(dynamodb, users_table, tenant_id)
        
        print("=" * 80)
        print("✅ POBLACIÓN DE DATOS COMPLETADA EXITOSAMENTE")
        print("=" * 80)
        print("\n📋 CREDENCIALES DE PRUEBA (Password: todos123):")
        print("-" * 80)
        print(f"  {'ROL':<12} | {'EMAIL':<25} | {'DESCRIPCIÓN'}")
        print("-" * 80)
        print(f"  {'USER':<12} | {'cliente@fridays.com':<25} | Cliente regular")
        print(f"  {'COOK':<12} | {'chef@fridays.com':<25} | Chef principal")
        print(f"  {'COOK':<12} | {'chef2@fridays.com':<25} | Cocinero adicional")
        print(f"  {'DISPATCHER':<12} | {'delivery@fridays.com':<25} | Conductor de delivery")
        print(f"  {'ADMIN':<12} | {'admin@fridays.com':<25} | Administrador")
        print("-" * 80)
        print(f"\n🔑 TenantId principal: {tenant_id}")
        print("\n💡 Usa estas credenciales en Postman para probar el flujo completo\n")
        
    except Exception as e:
        print(f"\n❌ ERROR FATAL: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
