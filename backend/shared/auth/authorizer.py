"""
Lambda Authorizer
Valida tokens JWT en requests a API Gateway
"""

import json
import sys
import os

# Agregar shared al path para imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from shared.auth.jwt_utils import decode_token, extract_token_from_header


def handler(event, context):
    """
    Lambda Authorizer para API Gateway
    Valida el token JWT y retorna una policy IAM
    """
    try:
        print(f"[Authorizer] Evento recibido: {json.dumps(event)}")
        
        # Extraer token según el tipo de authorizer
        # TOKEN authorizer: event['authorizationToken']
        # REQUEST authorizer: event['headers']['Authorization']
        if event.get('type') == 'TOKEN':
            authorization_header = event.get('authorizationToken', '')
        else:
            authorization_header = event.get('headers', {}).get('Authorization') or \
                                  event.get('headers', {}).get('authorization')
        
        token = extract_token_from_header(authorization_header)
        
        # Decodificar y validar token
        payload = decode_token(token)
        
        user_id = payload.get('userId')
        email = payload.get('email')
        role = payload.get('role')
        tenant_id = payload.get('tenantId')
        
        print(f"[Authorizer] Token válido para usuario {user_id} con rol {role}")
        
        # Generar policy IAM para permitir acceso a todos los endpoints
        # Convertir el methodArn específico a un wildcard
        # De: arn:aws:execute-api:region:account:api-id/stage/method/path
        # A:  arn:aws:execute-api:region:account:api-id/stage/*/*
        method_arn_parts = event['methodArn'].split('/')
        base_arn = '/'.join(method_arn_parts[:2])  # arn:aws:.../stage
        wildcard_arn = f"{base_arn}/*/*"
        
        policy = generate_policy(user_id, 'Allow', wildcard_arn, {
            'userId': user_id,
            'email': email,
            'role': role,
            'tenantId': tenant_id or ''
        })
        
        return policy
        
    except Exception as e:
        print(f"[Authorizer] Error de autorización: {str(e)}")
        # Retornar Deny policy con wildcard
        method_arn_parts = event['methodArn'].split('/')
        base_arn = '/'.join(method_arn_parts[:2])
        wildcard_arn = f"{base_arn}/*/*"
        return generate_policy('unauthorized', 'Deny', wildcard_arn)


def generate_policy(principal_id, effect, resource, context=None):
    """
    Genera una policy IAM para API Gateway
    """
    policy = {
        'principalId': principal_id,
        'policyDocument': {
            'Version': '2012-10-17',
            'Statement': [
                {
                    'Action': 'execute-api:Invoke',
                    'Effect': effect,
                    'Resource': resource
                }
            ]
        }
    }
    
    # Agregar context con información del usuario
    if context:
        policy['context'] = context
    
    return policy
