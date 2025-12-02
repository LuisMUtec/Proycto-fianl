"""
Lambda: UpdateStatus (applyStatus)
Descripción: Actualiza el estado de una orden y publica evento ORDER_STATUS_CHANGED
Endpoint: PUT /orders/{tenantId}/{orderId}/status
Body: { "status": "COOKING", "notes": "Opcional" }
"""

import json
import os
import boto3
from datetime import datetime
import sys

# Agregar shared al path para importar helpers
sys.path.insert(0, '/opt/python')
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../shared'))

from auth.auth_context import (
    get_auth_context, 
    require_role, 
    validate_tenant_access,
    AuthorizationError
)

dynamodb = boto3.resource('dynamodb')
eventbridge = boto3.client('events')

orders_table = dynamodb.Table(os.environ['ORDERS_TABLE'])
event_bus_name = os.environ.get('EVENT_BUS_NAME', 'default')

# Estados válidos para el flujo de órdenes
VALID_STATUSES = [
    'CREATED',
    'COOKING',
    'READY',
    'PACKAGED',
    'ON_THE_WAY',
    'DELIVERED',
    'CANCELLED'
]


def handler(event, context):
    """
    Actualiza el estado de una orden y publica evento en EventBridge
    """
    try:
        print(f"[UpdateStatus] Evento recibido: {json.dumps(event)}")
        
        # Usar helper para extraer contexto de autenticación
        try:
            auth = get_auth_context(event)
            # Validar que el usuario tiene rol de staff
            require_role(auth, ['COOK', 'DISPATCHER', 'ADMIN'])
        except AuthorizationError as e:
            return build_response(403, {
                'message': str(e),
                'code': 'FORBIDDEN'
            })
        
        # Extraer path parameters
        path_params = event.get('pathParameters', {})
        tenant_id = path_params.get('tenantId')
        order_id = path_params.get('orderId')
        
        # Extraer body
        body = json.loads(event.get('body', '{}'))
        new_status = body.get('status')
        notes = body.get('notes', '')
        
        # Usar el userId del contexto autenticado
        user_id = auth['userId']
        
        # Validaciones
        if not tenant_id:
            return build_response(400, {
                'message': 'tenantId es requerido',
                'code': 'VALIDATION_ERROR'
            })
        
        if not order_id:
            return build_response(400, {
                'message': 'orderId es requerido',
                'code': 'VALIDATION_ERROR'
            })
        
        if not new_status:
            return build_response(400, {
                'message': 'status es requerido en el body',
                'code': 'VALIDATION_ERROR'
            })
        
        if new_status not in VALID_STATUSES:
            return build_response(400, {
                'message': f'Estado inválido. Estados válidos: {", ".join(VALID_STATUSES)}',
                'code': 'VALIDATION_ERROR'
            })
        
        # Obtener orden actual
        try:
            response = orders_table.get_item(Key={'orderId': order_id})
            if 'Item' not in response:
                return build_response(404, {
                    'message': f'Orden {order_id} no encontrada',
                    'code': 'NOT_FOUND'
                })
            
            order = response['Item']
            
            # Validar que la orden pertenece al tenant usando el helper
            try:
                validate_tenant_access(auth, order.get('tenantId'))
            except AuthorizationError as e:
                return build_response(403, {
                    'message': str(e),
                    'code': 'FORBIDDEN'
                })
            
        except Exception as e:
            print(f"[UpdateStatus] Error al obtener orden: {str(e)}")
            return build_response(500, {
                'message': 'Error al obtener orden',
                'code': 'INTERNAL_ERROR',
                'details': str(e)
            })
        
        # Guardar estado anterior
        previous_status = order.get('status')
        current_time = datetime.utcnow().isoformat() + 'Z'
        
        # Actualizar orden en DynamoDB
        try:
            timeline = order.get('timeline', {})
            timeline[new_status] = current_time
            
            update_expression = "SET #status = :status, #updatedAt = :updatedAt, #timeline = :timeline"
            expression_attribute_names = {
                '#status': 'status',
                '#updatedAt': 'updatedAt',
                '#timeline': 'timeline'
            }
            expression_attribute_values = {
                ':status': new_status,
                ':updatedAt': current_time,
                ':timeline': timeline
            }
            
            # Si el estado es DELIVERED o CANCELLED, marcar como resuelto
            if new_status in ['DELIVERED', 'CANCELLED']:
                update_expression += ", #resolvedAt = :resolvedAt"
                expression_attribute_names['#resolvedAt'] = 'resolvedAt'
                expression_attribute_values[':resolvedAt'] = current_time
            
            # Actualizar asignaciones según el rol
            if user_id:
                # Determinar si es cocinero o despachador basado en el estado
                if new_status == 'COOKING' and not order.get('cookId'):
                    update_expression += ", #cookId = :userId"
                    expression_attribute_names['#cookId'] = 'cookId'
                    expression_attribute_values[':userId'] = user_id
                
                if new_status in ['PACKAGED', 'ON_THE_WAY'] and not order.get('dispatcherId'):
                    update_expression += ", #dispatcherId = :userId"
                    expression_attribute_names['#dispatcherId'] = 'dispatcherId'
                    expression_attribute_values[':userId'] = user_id
            
            orders_table.update_item(
                Key={'orderId': order_id},
                UpdateExpression=update_expression,
                ExpressionAttributeNames=expression_attribute_names,
                ExpressionAttributeValues=expression_attribute_values
            )
            
            print(f"[UpdateStatus] Orden {order_id} actualizada: {previous_status} -> {new_status}")
            
        except Exception as e:
            print(f"[UpdateStatus] Error al actualizar orden: {str(e)}")
            return build_response(500, {
                'message': 'Error al actualizar orden',
                'code': 'UPDATE_ERROR',
                'details': str(e)
            })
        
        # Publicar evento ORDER_STATUS_CHANGED en EventBridge
        try:
            event_detail = {
                'orderId': order_id,
                'tenantId': tenant_id,
                'userId': order.get('userId'),
                'previousStatus': previous_status,
                'newStatus': new_status,
                'changedBy': user_id,
                'notes': notes,
                'total': order.get('total'),
                'items': order.get('items', []),
                'userInfo': order.get('userInfo', {}),
                'timestamp': current_time,
                'eventType': 'ORDER_STATUS_CHANGED'
            }
            
            eventbridge_response = eventbridge.put_events(
                Entries=[
                    {
                        'Source': 'fridays.orders',
                        'DetailType': 'ORDER_STATUS_CHANGED',
                        'Detail': json.dumps(event_detail, default=str),
                        'EventBusName': event_bus_name
                    }
                ]
            )
            
            if eventbridge_response['FailedEntryCount'] > 0:
                print(f"[UpdateStatus] Advertencia: Error al publicar evento: {eventbridge_response}")
            else:
                print(f"[UpdateStatus] Evento ORDER_STATUS_CHANGED publicado exitosamente")
            
        except Exception as e:
            print(f"[UpdateStatus] Error al publicar evento (no crítico): {str(e)}")
        
        # Retornar respuesta exitosa
        return build_response(200, {
            'message': 'Estado actualizado exitosamente',
            'orderId': order_id,
            'previousStatus': previous_status,
            'newStatus': new_status,
            'updatedAt': current_time
        })
        
    except Exception as e:
        print(f"[UpdateStatus] Error inesperado: {str(e)}")
        return build_response(500, {
            'message': 'Error interno del servidor',
            'code': 'INTERNAL_ERROR',
            'details': str(e)
        })


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
            'Access-Control-Allow-Methods': 'PUT,OPTIONS'
        },
        'body': json.dumps(body, default=str)
    }
