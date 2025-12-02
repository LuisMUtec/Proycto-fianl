"""
Lambda: PublishOrderCreatedEvent
Descripción: Publica evento ORDER_CREATED en EventBridge
Entrada: Orden creada por PersistAndBuildOrder
Salida: Confirmación de evento publicado
"""

import json
import os
import boto3
from datetime import datetime

eventbridge = boto3.client('events')
event_bus_name = os.environ.get('EVENT_BUS_NAME', 'default')


def handler(event, context):
    """
    Publica evento ORDER_CREATED en EventBridge
    """
    try:
        print(f"[PublishOrderCreatedEvent] Evento recibido: {json.dumps(event, default=str)}")
        
        order_id = event.get('orderId')
        tenant_id = event.get('tenantId')
        user_id = event.get('userId')
        
        if not order_id:
            raise ValueError("orderId es requerido")
        
        # Construir evento para EventBridge
        event_detail = {
            'orderId': order_id,
            'tenantId': tenant_id,
            'userId': user_id,
            'status': 'CREATED',
            'total': event.get('total'),
            'items': event.get('items', []),
            'userInfo': event.get('userInfo', {}),
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'eventType': 'ORDER_CREATED'
        }
        
        # Publicar en EventBridge
        response = eventbridge.put_events(
            Entries=[
                {
                    'Source': 'fridays.orders',
                    'DetailType': 'ORDER_CREATED',
                    'Detail': json.dumps(event_detail, default=str),
                    'EventBusName': event_bus_name
                }
            ]
        )
        
        # Verificar que se publicó correctamente
        if response['FailedEntryCount'] > 0:
            print(f"[PublishOrderCreatedEvent] Error al publicar evento: {response}")
            raise Exception(f"Failed to publish event: {response['Entries']}")
        
        print(f"[PublishOrderCreatedEvent] Evento ORDER_CREATED publicado exitosamente para orden {order_id}")
        
        # Retornar la orden completa
        return {
            'orderId': order_id,
            'tenantId': tenant_id,
            'userId': user_id,
            'status': 'CREATED',
            'items': event.get('items', []),
            'total': event.get('total'),
            'createdAt': event.get('createdAt'),
            'eventPublished': True,
            'eventId': response['Entries'][0]['EventId']
        }
        
    except Exception as e:
        print(f"[PublishOrderCreatedEvent] Error al publicar evento: {str(e)}")
        raise Exception(f"PUBLISH_ERROR: {str(e)}")
