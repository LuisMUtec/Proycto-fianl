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
        
        # Extraer información del authorizer context (poblado por el JWT authorizer)
        authorizer = event.get('requestContext', {}).get('authorizer', {})
        user_id = authorizer.get('userId')
        tenant_id = authorizer.get('tenantId')
        role = authorizer.get('role', 'USER')
        
        # 🔍 DEBUG: Log detallado del authorizer context
        print(f"[onConnect] 🔍 Authorizer context: {json.dumps(authorizer)}")
        print(f"[onConnect] 🔍 userId extraído: '{user_id}'")
        print(f"[onConnect] 🔍 tenantId extraído: '{tenant_id}'")
        print(f"[onConnect] 🔍 role extraído: '{role}'")
        
        # Validaciones
        if not user_id:
            print(f"[onConnect] Error: userId no proporcionado en authorizer context")
            return {
                'statusCode': 400,
                'body': json.dumps({'message': 'userId no encontrado en token JWT'})
            }
        
        # tenantId puede ser null para usuarios regulares, solo validamos que exista el campo
        if tenant_id is None or tenant_id == '':
            print(f"[onConnect] ⚠️ Advertencia: tenantId es null/vacío para usuario {user_id}")
            # No retornamos error, permitimos conexión sin tenantId
        
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
        
        # 🔍 DEBUG: Confirmar datos guardados
        print(f"[onConnect] ✅ Conexión registrada: {connection_id} para usuario {user_id}")
        print(f"[onConnect] 🔍 Item guardado en DynamoDB: {json.dumps(connection_item, default=str)}")
        
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
