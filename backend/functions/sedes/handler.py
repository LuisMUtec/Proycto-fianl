"""
Lambda: Sedes Service
Maneja operaciones relacionadas con sedes (restaurantes)
"""

import json
import os
import boto3
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
sedes_table = dynamodb.Table(os.environ['SEDES_TABLE'])


def handler(event, context):
    """
    Router para operaciones de sedes
    """
    try:
        print(f"[Sedes] Evento recibido: {json.dumps(event)}")
        
        path = event.get('path', '')
        http_method = event.get('httpMethod', '')
        
        # Router
        if path.endswith('/sedes') and http_method == 'GET':
            return list_sedes(event)
        else:
            return build_response(404, {
                'message': 'Ruta no encontrada',
                'code': 'NOT_FOUND'
            })
            
    except Exception as e:
        print(f"[Sedes] Error: {str(e)}")
        return build_response(500, {
            'message': 'Error interno del servidor',
            'code': 'INTERNAL_ERROR',
            'details': str(e)
        })


def list_sedes(event):
    """
    Lista todas las sedes activas
    Endpoint público - no requiere autenticación
    """
    try:
        # Escanear todas las sedes
        response = sedes_table.scan()
        sedes = response.get('Items', [])
        
        # Filtrar solo sedes activas
        active_sedes = [sede for sede in sedes if sede.get('active', False)]
        
        # Ordenar por nombre
        active_sedes.sort(key=lambda x: x.get('name', ''))
        
        print(f"[Sedes] Retornando {len(active_sedes)} sedes activas")
        
        return build_response(200, {
            'sedes': active_sedes,
            'count': len(active_sedes)
        })
        
    except Exception as e:
        print(f"[Sedes] Error listando sedes: {str(e)}")
        return build_response(500, {
            'message': 'Error al listar sedes',
            'code': 'LIST_ERROR',
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
            'Access-Control-Allow-Methods': 'GET,OPTIONS'
        },
        'body': json.dumps(body, default=decimal_default)
    }


def decimal_default(obj):
    """
    Helper para serializar Decimal a JSON
    """
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError
