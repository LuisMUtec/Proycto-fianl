"""
Lambda: orderEventsToWS (broadcast)
Descripción: Escucha eventos de EventBridge (ORDER_CREATED, ORDER_STATUS_CHANGED)
y los envía a los clientes conectados vía WebSocket
"""

import json
import os
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
ws_connections_table = dynamodb.Table(os.environ['WS_CONNECTIONS_TABLE'])

# Cliente para API Gateway Management API (envío de mensajes WebSocket)
apigw_management_client = None


def get_apigw_client():
    """
    Inicializa el cliente de API Gateway Management API
    """
    global apigw_management_client
    if apigw_management_client is None:
        endpoint_url = os.environ['WEBSOCKET_ENDPOINT']
        apigw_management_client = boto3.client(
            'apigatewaymanagementapi',
            endpoint_url=endpoint_url
        )
    return apigw_management_client


def handler(event, context):
    """
    Procesa eventos de órdenes y los envía a clientes WebSocket conectados
    """
    try:
        print(f"[orderEventsToWS] Evento recibido: {json.dumps(event, default=str)}")
        
        # Extraer detalles del evento
        detail = event.get('detail', {})
        event_type = detail.get('eventType')
        order_id = detail.get('orderId')
        tenant_id = detail.get('tenantId')
        user_id = detail.get('userId')  # Usuario dueño de la orden
        new_status = detail.get('newStatus') or detail.get('status')
        
        # 🔍 DEBUG: Log detallado del evento recibido
        print(f"[orderEventsToWS] 🔍 Event detail completo: {json.dumps(detail, default=str)}")
        print(f"[orderEventsToWS] 🔍 eventType: '{event_type}'")
        print(f"[orderEventsToWS] 🔍 orderId: '{order_id}'")
        print(f"[orderEventsToWS] 🔍 userId extraído: '{user_id}'")
        print(f"[orderEventsToWS] 🔍 tenantId: '{tenant_id}'")
        print(f"[orderEventsToWS] Procesando evento {event_type} para orden {order_id}")
        
        # Construir mensaje para el cliente
        message = build_message(event_type, detail)
        
        # Obtener conexiones relevantes
        connections = get_relevant_connections(tenant_id, user_id)
        
        print(f"[orderEventsToWS] Encontradas {len(connections)} conexiones relevantes")
        
        # Enviar mensaje a cada conexión
        apigw_client = get_apigw_client()
        sent_count = 0
        failed_count = 0
        
        for connection in connections:
            connection_id = connection['connectionId']
            try:
                apigw_client.post_to_connection(
                    ConnectionId=connection_id,
                    Data=json.dumps(message, default=str).encode('utf-8')
                )
                sent_count += 1
                print(f"[orderEventsToWS] Mensaje enviado a conexión {connection_id}")
                
            except apigw_client.exceptions.GoneException:
                # Conexión ya no existe, eliminar de la tabla
                print(f"[orderEventsToWS] Conexión {connection_id} ya no existe, eliminando...")
                delete_stale_connection(connection_id)
                failed_count += 1
                
            except Exception as e:
                print(f"[orderEventsToWS] Error al enviar mensaje a {connection_id}: {str(e)}")
                failed_count += 1
        
        print(f"[orderEventsToWS] Resumen: {sent_count} enviados, {failed_count} fallidos")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Broadcast completado',
                'sentCount': sent_count,
                'failedCount': failed_count
            })
        }
        
    except Exception as e:
        print(f"[orderEventsToWS] Error inesperado: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Error al procesar broadcast',
                'error': str(e)
            })
        }


def build_message(event_type, detail):
    """
    Construye el mensaje a enviar al cliente según el tipo de evento
    """
    order_id = detail.get('orderId')
    status = detail.get('newStatus') or detail.get('status')
    
    # Mensajes amigables según el estado
    status_messages = {
        'CREATED': '✅ Tu pedido ha sido confirmado',
        'COOKING': '👨‍🍳 Tu pedido está en preparación',
        'READY': '🔔 Tu pedido está listo',
        'PACKAGED': '📦 Tu pedido está siendo empaquetado',
        'ON_THE_WAY': '🚗 Tu pedido está en camino',
        'DELIVERED': '🎉 ¡Pedido entregado! ¡Disfruta!',
        'CANCELLED': '❌ Tu pedido ha sido cancelado'
    }
    
    message = {
        'type': event_type,
        'orderId': order_id,
        'status': status,
        'message': status_messages.get(status, f'Estado actualizado: {status}'),
        'timestamp': detail.get('timestamp'),
        'data': {
            'orderId': order_id,
            'tenantId': detail.get('tenantId'),
            'status': status,
            'total': detail.get('total'),
            'items': detail.get('items', [])
        }
    }
    
    # Agregar información específica según el tipo de evento
    if event_type == 'ORDER_STATUS_CHANGED':
        message['data']['previousStatus'] = detail.get('previousStatus')
        message['data']['changedBy'] = detail.get('changedBy')
    
    return message


def get_relevant_connections(tenant_id, user_id):
    """
    Obtiene las conexiones WebSocket relevantes para notificar
    Notifica a:
    - El usuario dueño de la orden
    - Usuarios staff (COOK, DISPATCHER, ADMIN) del mismo tenant
    """
    connections = []
    
    try:
        # Obtener conexiones del usuario dueño de la orden
        if user_id:
            # 🔍 DEBUG: Log antes de consultar
            print(f"[orderEventsToWS] 🔍 Buscando conexiones para userId: '{user_id}'")
            
            response = ws_connections_table.query(
                IndexName='userId-index',
                KeyConditionExpression=Key('userId').eq(user_id)
            )
            user_connections = response.get('Items', [])
            
            # 🔍 DEBUG: Log de resultados de la query
            print(f"[orderEventsToWS] 🔍 Conexiones encontradas para userId '{user_id}': {len(user_connections)}")
            if user_connections:
                print(f"[orderEventsToWS] 🔍 Detalles de conexiones: {json.dumps(user_connections, default=str)}")
            else:
                print(f"[orderEventsToWS] ⚠️ NO se encontraron conexiones para userId '{user_id}'")
            
            connections.extend(user_connections)
        
        # Obtener conexiones del tenant (staff)
        if tenant_id:
            # 🔍 DEBUG: Log antes de consultar tenant
            print(f"[orderEventsToWS] 🔍 Buscando conexiones staff para tenantId: '{tenant_id}'")
            
            response = ws_connections_table.query(
                IndexName='tenantId-index',
                KeyConditionExpression=Key('tenantId').eq(tenant_id)
            )
            # Filtrar solo staff (COOK, DISPATCHER, ADMIN)
            staff_connections = [
                conn for conn in response.get('Items', [])
                if conn.get('role') in ['COOK', 'DISPATCHER', 'ADMIN']
            ]
            
            # 🔍 DEBUG: Log de conexiones staff
            print(f"[orderEventsToWS] 🔍 Conexiones staff encontradas: {len(staff_connections)}")
            
            connections.extend(staff_connections)
        
        # Eliminar duplicados por connectionId
        unique_connections = {conn['connectionId']: conn for conn in connections}
        final_connections = list(unique_connections.values())
        
        # 🔍 DEBUG: Log final de conexiones únicas
        print(f"[orderEventsToWS] 🔍 Total conexiones únicas a notificar: {len(final_connections)}")
        for conn in final_connections:
            print(f"[orderEventsToWS] 🔍   - connectionId: {conn['connectionId']}, userId: {conn.get('userId')}, role: {conn.get('role')}")
        
        return final_connections
        
    except Exception as e:
        print(f"[orderEventsToWS] Error al obtener conexiones: {str(e)}")
        return []


def delete_stale_connection(connection_id):
    """
    Elimina una conexión obsoleta de DynamoDB
    """
    try:
        ws_connections_table.delete_item(
            Key={'connectionId': connection_id}
        )
        print(f"[orderEventsToWS] Conexión obsoleta {connection_id} eliminada")
    except Exception as e:
        print(f"[orderEventsToWS] Error al eliminar conexión obsoleta: {str(e)}")
