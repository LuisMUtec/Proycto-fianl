"""
Lambda: CreateOrder
Descripción: Lambda que inicia el Step Function orderWorkflow
Endpoint: POST /orders
Body: { "items": [...], "notes": "...", "paymentMethod": "..." }
"""

import json
import os
import boto3
from datetime import datetime
import sys

# Agregar shared al path para importar helpers
sys.path.insert(0, '/opt/python')
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../shared'))

from auth.auth_context import get_auth_context, AuthorizationError

stepfunctions = boto3.client('stepfunctions')

state_machine_arn = os.environ['STATE_MACHINE_ARN']


def handler(event, context):
    """
    Inicia el Step Function orderWorkflow con los datos de la orden
    """
    try:
        print(f"[CreateOrder] Evento recibido: {json.dumps(event)}")
        
        # Extraer información del usuario autenticado
        try:
            auth = get_auth_context(event)
        except AuthorizationError as e:
            return build_response(403, {
                'message': str(e),
                'code': 'FORBIDDEN'
            })
        
        # Extraer body
        body = json.loads(event.get('body', '{}'))
        
        # Validar campos requeridos
        items = body.get('items', [])
        if not items:
            return build_response(400, {
                'message': 'items es requerido y no puede estar vacío',
                'code': 'VALIDATION_ERROR'
            })
        
        # Construir input para el Step Function
        workflow_input = {
            'userId': auth['userId'],
            'tenantId': body.get('tenantId'),
            'items': items,
            'notes': body.get('notes', ''),
            'paymentMethod': body.get('paymentMethod', 'CASH'),
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }
        
        # Si el usuario es staff, usar su tenantId
        if auth.get('tenantId'):
            workflow_input['tenantId'] = auth['tenantId']
        
        # Iniciar ejecución del Step Function
        print(f"[CreateOrder] Iniciando Step Function con input: {json.dumps(workflow_input)}")
        
        response = stepfunctions.start_execution(
            stateMachineArn=state_machine_arn,
            input=json.dumps(workflow_input, default=str)
        )
        
        execution_arn = response['executionArn']
        
        print(f"[CreateOrder] Step Function iniciado: {execution_arn}")
        
        # Retornar respuesta
        return build_response(202, {
            'message': 'Orden en proceso de creación',
            'executionArn': execution_arn,
            'status': 'PROCESSING'
        })
        
    except Exception as e:
        print(f"[CreateOrder] Error inesperado: {str(e)}")
        import traceback
        traceback.print_exc()
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
            'Access-Control-Allow-Methods': 'POST,OPTIONS'
        },
        'body': json.dumps(body, default=str)
    }
