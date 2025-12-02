"""
JWT Utilities
Maneja la creación y validación de tokens JWT usando secret de AWS Systems Manager Parameter Store
"""

import jwt
import os
import boto3
from datetime import datetime, timedelta
from functools import lru_cache

ssm = boto3.client('ssm')

# Cache del secret para evitar múltiples llamadas a Parameter Store
@lru_cache(maxsize=1)
def get_jwt_secret():
    """
    Obtiene el JWT secret de AWS Systems Manager Parameter Store
    """
    try:
        secret_name = os.environ.get('JWT_SECRET_PARAM', '/fridays/jwt-secret')
        response = ssm.get_parameter(Name=secret_name, WithDecryption=True)
        return response['Parameter']['Value']
    except Exception as e:
        print(f"Error obteniendo JWT secret: {str(e)}")
        raise Exception("No se pudo obtener el JWT secret")


def generate_token(user_id, email, role, tenant_id=None):
    """
    Genera un token JWT para un usuario
    """
    secret = get_jwt_secret()
    
    payload = {
        'userId': user_id,
        'email': email,
        'role': role,
        'tenantId': tenant_id,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(days=7)  # Token válido por 7 días
    }
    
    token = jwt.encode(payload, secret, algorithm='HS256')
    return token


def decode_token(token):
    """
    Decodifica y valida un token JWT
    Retorna el payload si es válido, levanta excepción si no
    """
    secret = get_jwt_secret()
    
    try:
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        raise Exception("Token expirado")
    except jwt.InvalidTokenError:
        raise Exception("Token inválido")


def extract_token_from_header(authorization_header):
    """
    Extrae el token del header Authorization
    Formato esperado: "Bearer <token>"
    """
    if not authorization_header:
        raise Exception("No se proporcionó token de autorización")
    
    parts = authorization_header.split()
    
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise Exception("Formato de token inválido. Use: Bearer <token>")
    
    return parts[1]
