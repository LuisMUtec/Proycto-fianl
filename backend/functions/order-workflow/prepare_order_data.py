"""
Lambda: PrepareOrderData
Descripción: Valida y prepara los datos de la orden antes de persistir
Entrada: requestId, tenantId, userId, items, notes, paymentMethod
Salida: Datos validados y enriquecidos con información de productos
"""

import json
import os
import boto3
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
products_table = dynamodb.Table(os.environ['PRODUCTS_TABLE'])
users_table = dynamodb.Table(os.environ['USERS_TABLE'])


def handler(event, context):
    """
    Valida los datos de entrada y enriquece con información de productos
    """
    try:
        print(f"[PrepareOrderData] Evento recibido: {json.dumps(event)}")
        
        # Extraer datos del evento
        request_id = event.get('requestId')
        tenant_id = event.get('tenantId')
        user_id = event.get('userId')
        items = event.get('items', [])
        notes = event.get('notes', '')
        payment_method = event.get('paymentMethod', 'CASH')
        delivery_address = event.get('deliveryAddress', '')
        
        # Validaciones básicas
        if not tenant_id:
            raise ValueError("tenantId es requerido")
        
        if not user_id:
            raise ValueError("userId es requerido")
        
        if not items or len(items) == 0:
            raise ValueError("La orden debe contener al menos un item")
        
        # Validar que el usuario existe
        try:
            user_response = users_table.get_item(Key={'userId': user_id})
            if 'Item' not in user_response:
                raise ValueError(f"Usuario {user_id} no encontrado")
            user = user_response['Item']
        except Exception as e:
            print(f"[PrepareOrderData] Error al obtener usuario: {str(e)}")
            raise ValueError(f"Error al validar usuario: {str(e)}")
        
        # Enriquecer items con información de productos
        enriched_items = []
        total = Decimal('0')
        
        for item in items:
            product_id = item.get('productId')
            quantity = item.get('quantity', 1)
            
            if not product_id:
                raise ValueError("Cada item debe tener un productId")
            
            if quantity <= 0:
                raise ValueError(f"Cantidad inválida para producto {product_id}")
            
            # Obtener información del producto
            try:
                product_response = products_table.get_item(Key={'productId': product_id})
                if 'Item' not in product_response:
                    raise ValueError(f"Producto {product_id} no encontrado")
                
                product = product_response['Item']
                
                # Validar disponibilidad
                if not product.get('available', False):
                    raise ValueError(f"Producto {product.get('name', product_id)} no está disponible")
                
                # Validar que el producto pertenece al tenant
                if product.get('tenantId') != tenant_id:
                    raise ValueError(f"Producto {product_id} no pertenece a la sede {tenant_id}")
                
                # Enriquecer item
                unit_price = Decimal(str(product['price']))
                item_total = unit_price * Decimal(str(quantity))
                
                enriched_items.append({
                    'productId': product_id,
                    'name': product.get('name', 'Unknown'),
                    'quantity': quantity,
                    'unitPrice': unit_price,  # Mantener como Decimal
                    'subtotal': item_total,    # Mantener como Decimal
                    'preparationTimeMinutes': product.get('preparationTime', 15)
                })
                
                total += item_total
                
            except Exception as e:
                print(f"[PrepareOrderData] Error al procesar producto {product_id}: {str(e)}")
                raise ValueError(f"Error al validar producto {product_id}: {str(e)}")
        
        # Preparar datos de salida
        prepared_data = {
            'requestId': request_id,
            'tenantId': tenant_id,
            'userId': user_id,
            'userInfo': {
                'firstName': user.get('firstName', ''),
                'lastName': user.get('lastName', ''),
                'email': user.get('email', ''),
                'phoneNumber': user.get('phoneNumber', ''),
                'address': user.get('address', '')
            },
            'items': enriched_items,
            'notes': notes,
            'paymentMethod': payment_method,
            'deliveryAddress': delivery_address,
            'total': total,  # Mantener como Decimal para DynamoDB
            'estimatedPreparationTime': max([item['preparationTimeMinutes'] for item in enriched_items]),
            'preparedAt': datetime.utcnow().isoformat() + 'Z'
        }
        
        print(f"[PrepareOrderData] Datos preparados exitosamente: {json.dumps(prepared_data, default=str)}")
        
        return prepared_data
        
    except ValueError as e:
        print(f"[PrepareOrderData] Error de validación: {str(e)}")
        raise Exception(f"VALIDATION_ERROR: {str(e)}")
    
    except Exception as e:
        print(f"[PrepareOrderData] Error inesperado: {str(e)}")
        raise Exception(f"INTERNAL_ERROR: {str(e)}")
