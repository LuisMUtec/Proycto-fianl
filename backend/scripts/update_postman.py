"""
Script to add new Postman requests for sedes functionality
"""
import json

# Read the collection
with open('postman_collection.json', 'r', encoding='utf-8') as f:
    collection = json.load(f)

# Find the "Productos (Menú)" section
productos_idx = None
for idx, item in enumerate(collection['item']):
    if '1. Productos' in item['name']:
        productos_idx = idx
        break

if productos_idx is None:
    print("❌ No se encontró la sección de Productos")
    exit(1)

# Create new Sedes section
sedes_section = {
    "name": "🏢 1.5. Sedes (Restaurantes)",
    "item": [
        {
            "name": "Listar Sedes (Público)",
            "request": {
                "method": "GET",
                "header": [],
                "url": {
                    "raw": "{{base_url}}/sedes",
                    "host": ["{{base_url}}"],
                    "path": ["sedes"]
                },
                "description": "Lista todas las sedes activas disponibles. Endpoint público, no requiere autenticación.\\n\\n📍 Retorna información de cada sede:\\n- tenantId: ID único de la sede\\n- name: Nombre del restaurante\\n- address: Dirección completa\\n- city: Ciudad\\n- district: Distrito\\n- coordinates: Latitud y longitud\\n- openingHours: Horarios de atención\\n- phone: Teléfono de contacto\\n\\n💡 Usa el tenantId al crear una orden para especificar de qué sede quieres ordenar."
            },
            "response": []
        }
    ]
}

# Insert after Productos section
collection['item'].insert(productos_idx + 1, sedes_section)

# Update the order creation request to include tenantId in description
for item in collection['item']:
    if '2. Order Workflow' in item['name']:
        for sub_item in item['item']:
            if 'Crear Orden' in sub_item['name']:
                # Update the body to include tenantId example
                current_body = json.loads(sub_item['request']['body']['raw'])
                current_body['tenantId'] = 'sede-miraflores-001'
                sub_item['request']['body']['raw'] = json.dumps(current_body, indent=2, ensure_ascii=False)
                
                # Update description
                sub_item['request']['description'] = sub_item['request']['description'].replace(
                    '📦 userId y tenantId: Se extraen automáticamente del token',
                    '📦 userId: Se extrae automáticamente del token\\n🏢 tenantId: Opcional. Si no se especifica, usa la sede del usuario (del JWT)'
                )
                break
        break

# Write back
with open('postman_collection.json', 'w', encoding='utf-8') as f:
    json.dump(collection, f, indent=2, ensure_ascii=False)

print("✅ Postman collection actualizada exitosamente")
print("📍 Agregada sección '🏢 1.5. Sedes (Restaurantes)'")
print("📝 Actualizado 'POST /orders' con campo tenantId")
