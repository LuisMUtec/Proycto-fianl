"""
Lambda: onConnect
Descripción: Maneja conexiones WebSocket ($connect)
Registra la conexión en DynamoDB para enviar notificaciones posteriores
"""

import json
import os
import boto3
from datetime import datetime, timedelta

dynamodb = boto3.resource('dynamodb')
ws_connections_table = dynamodb.Table(os.environ['WS_CONNECTIONS_TABLE'])


def handler(event, context):
    """
    Registra una nueva conexión WebSocket en DynamoDB
    """
    try:
        print(f"[onConnect] Evento recibido: {json.dumps(event)}")
        
        # Extraer información de la conexión
        connection_id = event['requestContext']['connectionId']
        
        # Extraer query string parameters (userId, tenantId, role)
        query_params = event.get('queryStringParameters') or {}
        user_id = query_params.get('userId')
        tenant_id = query_params.get('tenantId')
        role = query_params.get('role', 'USER')
        
        # Validaciones
        if not user_id:
            print(f"[onConnect] Error: userId no proporcionado")
            return {
                'statusCode': 400,
                'body': json.dumps({'message': 'userId es requerido en query string'})
            }
        
        if not tenant_id:
            print(f"[onConnect] Error: tenantId no proporcionado")
            return {
                'statusCode': 400,
                'body': json.dumps({'message': 'tenantId es requerido en query string'})
            }
        
        # Calcular TTL (24 horas desde ahora)
        current_time = datetime.utcnow()
        ttl = int((current_time + timedelta(hours=24)).timestamp())
        
        # Guardar conexión en DynamoDB
        connection_item = {
            'connectionId': connection_id,
            'userId': user_id,
            'tenantId': tenant_id,
            'role': role,
            'connectedAt': current_time.isoformat() + 'Z',
            'ttl': ttl
        }
        
        ws_connections_table.put_item(Item=connection_item)
        
        print(f"[onConnect] Conexión registrada: {connection_id} para usuario {user_id}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Conectado exitosamente',
                'connectionId': connection_id
            })
        }
        
    except Exception as e:
        print(f"[onConnect] Error al registrar conexión: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Error al establecer conexión',
                'error': str(e)
            })
        }
