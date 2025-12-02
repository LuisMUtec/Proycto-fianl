"""
Lambda: onDisconnect
Descripción: Maneja desconexiones WebSocket ($disconnect)
Elimina el registro de conexión de DynamoDB
"""

import json
import os
import boto3

dynamodb = boto3.resource('dynamodb')
ws_connections_table = dynamodb.Table(os.environ['WS_CONNECTIONS_TABLE'])


def handler(event, context):
    """
    Elimina una conexión WebSocket de DynamoDB
    """
    try:
        print(f"[onDisconnect] Evento recibido: {json.dumps(event)}")
        
        # Extraer connectionId
        connection_id = event['requestContext']['connectionId']
        
        # Eliminar de DynamoDB
        ws_connections_table.delete_item(
            Key={'connectionId': connection_id}
        )
        
        print(f"[onDisconnect] Conexión eliminada: {connection_id}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Desconectado exitosamente'
            })
        }
        
    except Exception as e:
        print(f"[onDisconnect] Error al eliminar conexión: {str(e)}")
        # No devolvemos error 500 porque la conexión ya está cerrada
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Desconexión procesada'
            })
        }
