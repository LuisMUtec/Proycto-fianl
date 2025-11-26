"""
Lambda: Producto Service
CRUD de productos con integración a S3 para imágenes
"""

import json
import os
import boto3
import uuid
from datetime import datetime
from decimal import Decimal
import sys

# Agregar shared al path para importar helpers
sys.path.insert(0, '/opt/python')
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../shared'))

from auth.auth_context import (
    get_auth_context,
    require_role,
    is_admin,
    AuthorizationError
)

dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')

products_table = dynamodb.Table(os.environ['PRODUCTS_TABLE'])
s3_bucket = os.environ.get('S3_BUCKET', 'fridays-images')


def handler(event, context):
    """
    Router para operaciones CRUD de productos
    """
    try:
        print(f"[ProductoService] Evento recibido: {json.dumps(event)}")
        
        # Extraer información del authorizer usando helper
        auth = None
        try:
            auth = get_auth_context(event)
        except AuthorizationError:
            # Las rutas públicas (GET) no requieren autenticación
            pass
        
        path = event.get('path', '')
        http_method = event.get('httpMethod', '')
        
        # Router
        if path == '/menu' and http_method == 'GET':
            tenant_id = auth.get('tenantId') if auth else None
            return list_products(event, tenant_id)
        elif path.startswith('/menu/') and http_method == 'GET':
            # GET /menu/{category}
            category = path.split('/')[-1]
            tenant_id = auth.get('tenantId') if auth else None
            return list_products_by_category(event, tenant_id, category)
        elif path == '/menu/productos' and http_method == 'POST':
            # Solo ADMIN puede crear productos
            try:
                require_role(auth, ['ADMIN'])
            except AuthorizationError as e:
                return build_response(403, {
                    'message': str(e),
                    'code': 'FORBIDDEN'
                })
            return create_product(event, auth['userId'], auth.get('tenantId'))
        elif path.endswith('/availability') and http_method == 'PUT':
            # Solo ADMIN puede cambiar disponibilidad (DEBE IR ANTES DE /menu/items/)
            try:
                require_role(auth, ['ADMIN'])
            except AuthorizationError as e:
                return build_response(403, {
                    'message': str(e),
                    'code': 'FORBIDDEN'
                })
            product_id = path.split('/')[-2]
            print(f"[ProductoService] Path: {path}, Product ID extraído: {product_id}")
            return update_availability(event, auth['userId'], product_id, auth.get('tenantId'))
        elif path.startswith('/menu/items/') and http_method == 'PUT':
            # Solo ADMIN puede cambiar disponibilidad
            try:
                require_role(auth, ['ADMIN'])
            except AuthorizationError as e:
                return build_response(403, {
                    'message': str(e),
                    'code': 'FORBIDDEN'
                })
            # Solo ADMIN puede actualizar productos
            try:
                require_role(auth, ['ADMIN'])
            except AuthorizationError as e:
                return build_response(403, {
                    'message': str(e),
                    'code': 'FORBIDDEN'
                })
            product_id = path.split('/')[-1]
            return update_product(event, auth['userId'], product_id, auth.get('tenantId'))
        else:
            return build_response(404, {
                'message': 'Ruta no encontrada',
                'code': 'NOT_FOUND'
            })
            
    except Exception as e:
        print(f"[ProductoService] Error: {str(e)}")
        return build_response(500, {
            'message': 'Error interno del servidor',
            'code': 'INTERNAL_ERROR',
            'details': str(e)
        })


def list_products(event, tenant_id=None):
    """
    Lista productos con paginación
    GET /menu?limit=20&lastKey=PRODUCT#001
    """
    try:
        query_params = event.get('queryStringParameters') or {}
        limit = int(query_params.get('limit', 20))
        last_key = query_params.get('lastKey')
        filter_tenant = query_params.get('tenantId', tenant_id)
        
        # Si no hay tenant específico, listar todos
        if filter_tenant:
            response = products_table.query(
                IndexName='tenantId-index',
                KeyConditionExpression='tenantId = :tenantId',
                ExpressionAttributeValues={':tenantId': filter_tenant},
                Limit=limit
            )
        else:
            scan_params = {'Limit': limit}
            if last_key:
                scan_params['ExclusiveStartKey'] = {'productId': last_key}
            response = products_table.scan(**scan_params)
        
        items = response.get('Items', [])
        
        # Convertir Decimal a float para JSON
        products = [convert_decimals(item) for item in items]
        
        result = {
            'products': products,
            'count': len(products)
        }
        
        if 'LastEvaluatedKey' in response:
            result['lastKey'] = response['LastEvaluatedKey']['productId']
        
        return build_response(200, result)
        
    except Exception as e:
        print(f"[ProductoService] Error en list_products: {str(e)}")
        return build_response(500, {
            'message': 'Error al listar productos',
            'code': 'LIST_ERROR',
            'details': str(e)
        })


def list_products_by_category(event, tenant_id, category):
    """
    Lista productos filtrados por categoría
    GET /menu/{category}
    """
    try:
        query_params = event.get('queryStringParameters') or {}
        limit = int(query_params.get('limit', 20))
        filter_tenant = query_params.get('tenantId', tenant_id)
        
        # Scan con filtro de categoría
        scan_params = {
            'FilterExpression': 'category = :category',
            'ExpressionAttributeValues': {':category': category.upper()},
            'Limit': limit
        }
        
        if filter_tenant:
            scan_params['FilterExpression'] += ' AND tenantId = :tenantId'
            scan_params['ExpressionAttributeValues'][':tenantId'] = filter_tenant
        
        response = products_table.scan(**scan_params)
        
        items = response.get('Items', [])
        products = [convert_decimals(item) for item in items]
        
        return build_response(200, {
            'category': category,
            'products': products,
            'count': len(products)
        })
        
    except Exception as e:
        print(f"[ProductoService] Error en list_products_by_category: {str(e)}")
        return build_response(500, {
            'message': 'Error al listar productos por categoría',
            'code': 'LIST_CATEGORY_ERROR',
            'details': str(e)
        })


def create_product(event, user_id, tenant_id):
    """
    Crea un nuevo producto (solo ADMIN)
    POST /menu/productos
    """
    try:
        body = json.loads(event.get('body', '{}'))
        
        # Validaciones
        name = body.get('name')
        price = body.get('price')
        category = body.get('category', 'FOOD')
        
        if not name or not price:
            return build_response(400, {
                'message': 'name y price son requeridos',
                'code': 'VALIDATION_ERROR'
            })
        
        if not tenant_id:
            return build_response(400, {
                'message': 'tenantId es requerido',
                'code': 'VALIDATION_ERROR'
            })
        
        # Generar productId
        product_id = str(uuid.uuid4())
        current_time = datetime.utcnow().isoformat() + 'Z'
        
        # Crear producto
        product = {
            'productId': product_id,
            'tenantId': tenant_id,
            'name': name,
            'description': body.get('description', ''),
            'category': category.upper(),
            'price': Decimal(str(price)),
            'currency': body.get('currency', 'PEN'),
            'isAvailable': body.get('isAvailable', True),
            'preparationTimeMinutes': body.get('preparationTimeMinutes', 15),
            'imageKey': body.get('imageKey', ''),
            'imageUrl': body.get('imageUrl', ''),
            'tags': body.get('tags', []),
            'createdAt': current_time,
            'updatedAt': current_time,
            'createdBy': user_id,
            'updatedBy': user_id
        }
        
        products_table.put_item(Item=product)
        
        print(f"[ProductoService] Producto creado: {product_id}")
        
        return build_response(201, {
            'message': 'Producto creado exitosamente',
            'product': convert_decimals(product)
        })
        
    except Exception as e:
        print(f"[ProductoService] Error en create_product: {str(e)}")
        return build_response(500, {
            'message': 'Error al crear producto',
            'code': 'CREATE_ERROR',
            'details': str(e)
        })


def update_product(event, user_id, product_id, tenant_id):
    """
    Actualiza un producto existente (solo ADMIN)
    PUT /menu/items/{itemId}
    """
    try:
        body = json.loads(event.get('body', '{}'))
        
        # Verificar que el producto existe
        response = products_table.get_item(Key={'productId': product_id})
        if 'Item' not in response:
            return build_response(404, {
                'message': 'Producto no encontrado',
                'code': 'NOT_FOUND'
            })
        
        product = response['Item']
        
        # Validar que el producto pertenece al tenant
        if product.get('tenantId') != tenant_id:
            return build_response(403, {
                'message': 'No tienes permisos para actualizar este producto',
                'code': 'FORBIDDEN'
            })
        
        # Construir expresión de actualización
        update_expression = "SET #updatedAt = :updatedAt, #updatedBy = :updatedBy"
        expression_names = {
            '#updatedAt': 'updatedAt',
            '#updatedBy': 'updatedBy'
        }
        expression_values = {
            ':updatedAt': datetime.utcnow().isoformat() + 'Z',
            ':updatedBy': user_id
        }
        
        # Campos actualizables
        updatable_fields = ['name', 'description', 'price', 'category', 'preparationTimeMinutes', 'imageKey', 'imageUrl', 'tags']
        
        for field in updatable_fields:
            if field in body:
                update_expression += f", #{field} = :{field}"
                expression_names[f'#{field}'] = field
                value = body[field]
                if field == 'price':
                    value = Decimal(str(value))
                expression_values[f':{field}'] = value
        
        # Actualizar en DynamoDB
        products_table.update_item(
            Key={'productId': product_id},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_names,
            ExpressionAttributeValues=expression_values
        )
        
        print(f"[ProductoService] Producto actualizado: {product_id}")
        
        return build_response(200, {
            'message': 'Producto actualizado exitosamente',
            'productId': product_id
        })
        
    except Exception as e:
        print(f"[ProductoService] Error en update_product: {str(e)}")
        return build_response(500, {
            'message': 'Error al actualizar producto',
            'code': 'UPDATE_ERROR',
            'details': str(e)
        })


def update_availability(event, user_id, product_id, tenant_id):
    """
    Actualiza la disponibilidad de un producto (solo ADMIN)
    PUT /menu/items/{itemId}/availability
    """
    try:
        body = json.loads(event.get('body', '{}'))
        is_available = body.get('isAvailable')
        
        if is_available is None:
            return build_response(400, {
                'message': 'isAvailable es requerido',
                'code': 'VALIDATION_ERROR'
            })
        
        # Verificar que el producto existe
        print(f"[ProductoService] Buscando producto con productId: {product_id}")
        response = products_table.get_item(Key={'productId': product_id})
        print(f"[ProductoService] Respuesta DynamoDB: {response}")
        if 'Item' not in response:
            return build_response(404, {
                'message': 'Producto no encontrado',
                'code': 'NOT_FOUND'
            })
        
        product = response['Item']
        
        # Validar que el producto pertenece al tenant
        if product.get('tenantId') != tenant_id:
            return build_response(403, {
                'message': 'No tienes permisos para actualizar este producto',
                'code': 'FORBIDDEN'
            })
        
        # Actualizar disponibilidad
        products_table.update_item(
            Key={'productId': product_id},
            UpdateExpression="SET isAvailable = :isAvailable, updatedAt = :updatedAt, updatedBy = :updatedBy",
            ExpressionAttributeValues={
                ':isAvailable': is_available,
                ':updatedAt': datetime.utcnow().isoformat() + 'Z',
                ':updatedBy': user_id
            }
        )
        
        print(f"[ProductoService] Disponibilidad actualizada: {product_id} -> {is_available}")
        
        return build_response(200, {
            'message': 'Disponibilidad actualizada exitosamente',
            'productId': product_id,
            'isAvailable': is_available
        })
        
    except Exception as e:
        print(f"[ProductoService] Error en update_availability: {str(e)}")
        return build_response(500, {
            'message': 'Error al actualizar disponibilidad',
            'code': 'UPDATE_AVAILABILITY_ERROR',
            'details': str(e)
        })


def convert_decimals(obj):
    """
    Convierte objetos Decimal a float para serialización JSON
    """
    if isinstance(obj, list):
        return [convert_decimals(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_decimals(value) for key, value in obj.items()}
    elif isinstance(obj, Decimal):
        return float(obj)
    else:
        return obj


def build_response(status_code, body):
    """
    Construye una respuesta HTTP estandarizada
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS'
        },
        'body': json.dumps(body, default=str)
    }
