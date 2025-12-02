"""
Lambda: PersistAndBuildOrder
Descripción: Persiste la orden en DynamoDB con toda la información preparada
Entrada: Datos preparados por PrepareOrderData
Salida: Orden creada con orderId generado
"""

import json
import os
import boto3
import uuid
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
orders_table = dynamodb.Table(os.environ['ORDERS_TABLE'])


def handler(event, context):
    """
    Persiste la orden en DynamoDB
    """
    try:
        print(f"[PersistAndBuildOrder] Evento recibido: {json.dumps(event, default=str)}")
        
        # Generar orderId único
        order_id = str(uuid.uuid4())
        current_time = datetime.utcnow().isoformat() + 'Z'
        
        # Asegurar que todos los números son Decimal para DynamoDB
        items = []
        for item in event['items']:
            items.append({
                'productId': item['productId'],
                'name': item['name'],
                'quantity': item['quantity'],
                'unitPrice': Decimal(str(item['unitPrice'])),
                'subtotal': Decimal(str(item['subtotal'])),
                'preparationTimeMinutes': Decimal(str(item['preparationTimeMinutes']))
            })
        
        # Construir objeto de orden
        order = {
            'orderId': order_id,
            'tenantId': event['tenantId'],
            'userId': event['userId'],
            'userInfo': event.get('userInfo', {}),
            'status': 'CREATED',
            'items': items,
            'notes': event.get('notes', ''),
            'paymentMethod': event.get('paymentMethod', 'CASH'),
            'deliveryAddress': event.get('deliveryAddress', ''),
            'total': Decimal(str(event['total'])),
            'estimatedPreparationTime': Decimal(str(event.get('estimatedPreparationTime', 15))),
            'createdAt': current_time,
            'updatedAt': current_time,
            'timeline': {
                'CREATED': current_time
            },
            'cookId': None,
            'dispatcherId': None,
            'resolvedAt': None
        }
        
        # Guardar en DynamoDB
        orders_table.put_item(Item=order)
        
        print(f"[PersistAndBuildOrder] Orden {order_id} persistida exitosamente")
        
        # Retornar orden creada con todos los datos
        return {
            'orderId': order_id,
            'tenantId': order['tenantId'],
            'userId': order['userId'],
            'userInfo': order['userInfo'],
            'status': order['status'],
            'items': order['items'],
            'notes': order['notes'],
            'paymentMethod': order['paymentMethod'],
            'total': order['total'],
            'estimatedPreparationTime': order['estimatedPreparationTime'],
            'createdAt': order['createdAt'],
            'requestId': event.get('requestId')
        }
        
    except Exception as e:
        print(f"[PersistAndBuildOrder] Error al persistir orden: {str(e)}")
        raise Exception(f"PERSIST_ERROR: {str(e)}")
