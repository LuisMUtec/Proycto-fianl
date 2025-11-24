"""
Lambda: Auth (Register & Login)
Maneja registro y autenticación de usuarios
"""

import json
import os
import boto3
import uuid
import hashlib
from datetime import datetime
import sys

# Agregar shared al path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from shared.auth.jwt_utils import generate_token

dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table(os.environ['USERS_TABLE'])


def handler(event, context):
    """
    Router para register y login
    """
    try:
        print(f"[Auth] Evento recibido: {json.dumps(event)}")
        
        path = event.get('path', '')
        http_method = event.get('httpMethod', '')
        
        # Router
        if path.endswith('/register') and http_method == 'POST':
            return register(event)
        elif path.endswith('/login') and http_method == 'POST':
            return login(event)
        else:
            return build_response(404, {
                'message': 'Ruta no encontrada',
                'code': 'NOT_FOUND'
            })
            
    except Exception as e:
        print(f"[Auth] Error: {str(e)}")
        return build_response(500, {
            'message': 'Error interno del servidor',
            'code': 'INTERNAL_ERROR',
            'details': str(e)
        })


def register(event):
    """
    Registra un nuevo usuario
    """
    try:
        body = json.loads(event.get('body', '{}'))
        
        # Extraer datos
        email = body.get('email', '').lower().strip()
        password = body.get('password', '')
        first_name = body.get('firstName', '')
        last_name = body.get('lastName', '')
        phone_number = body.get('phoneNumber', '')
        address = body.get('address', '')
        
        # SEGURIDAD: El rol siempre es USER para registro público
        # Los roles administrativos (COOK, DISPATCHER, ADMIN) deben crearse desde el panel de administración
        role = 'USER'
        tenant_id = 'sede-miraflores-001'  # Todos los usuarios se asignan a la sede principal por defecto
        
        # Validaciones
        if not email:
            return build_response(400, {
                'message': 'Email es requerido',
                'code': 'VALIDATION_ERROR'
            })
        
        if not password or len(password) < 6:
            return build_response(400, {
                'message': 'Password debe tener al menos 6 caracteres',
                'code': 'VALIDATION_ERROR'
            })
        
        if not first_name or not last_name:
            return build_response(400, {
                'message': 'Nombre y apellido son requeridos',
                'code': 'VALIDATION_ERROR'
            })
        
        # Verificar si el email ya existe
        response = users_table.query(
            IndexName='email-index',
            KeyConditionExpression='email = :email',
            ExpressionAttributeValues={':email': email}
        )
        
        if response.get('Items'):
            return build_response(409, {
                'message': 'El email ya está registrado',
                'code': 'EMAIL_EXISTS'
            })
        
        # Generar userId
        user_id = str(uuid.uuid4())
        
        # Hashear password
        password_hash = hash_password(password)
        
        # Crear usuario
        current_time = datetime.utcnow().isoformat() + 'Z'
        
        user = {
            'userId': user_id,
            'email': email,
            'passwordHash': password_hash,
            'firstName': first_name,
            'lastName': last_name,
            'phoneNumber': phone_number,
            'address': address,
            'role': role,
            'status': 'ACTIVE',
            'createdAt': current_time,
            'updatedAt': current_time
        }
        
        # Agregar tenantId a todos los usuarios
        user['tenantId'] = tenant_id
        
        # Guardar en DynamoDB
        users_table.put_item(Item=user)
        
        print(f"[Auth] Usuario registrado: {user_id} ({email})")
        
        # Generar token JWT
        token = generate_token(user_id, email, role, tenant_id)
        
        # Retornar respuesta
        return build_response(201, {
            'message': 'Usuario registrado exitosamente',
            'user': {
                'userId': user_id,
                'email': email,
                'firstName': first_name,
                'lastName': last_name,
                'role': role,
                'tenantId': tenant_id
            },
            'token': token
        })
        
    except Exception as e:
        print(f"[Auth] Error en register: {str(e)}")
        return build_response(500, {
            'message': 'Error al registrar usuario',
            'code': 'REGISTER_ERROR',
            'details': str(e)
        })


def login(event):
    """
    Autentica un usuario y retorna token JWT
    """
    try:
        body = json.loads(event.get('body', '{}'))
        
        email = body.get('email', '').lower().strip()
        password = body.get('password', '')
        
        # Validaciones
        if not email or not password:
            return build_response(400, {
                'message': 'Email y password son requeridos',
                'code': 'VALIDATION_ERROR'
            })
        
        # Buscar usuario por email
        response = users_table.query(
            IndexName='email-index',
            KeyConditionExpression='email = :email',
            ExpressionAttributeValues={':email': email}
        )
        
        if not response.get('Items'):
            return build_response(401, {
                'message': 'Credenciales inválidas',
                'code': 'INVALID_CREDENTIALS'
            })
        
        user = response['Items'][0]
        
        # Verificar status
        if user.get('status') != 'ACTIVE':
            return build_response(403, {
                'message': 'Usuario inactivo o bloqueado',
                'code': 'USER_INACTIVE'
            })
        
        # Verificar password
        password_hash = hash_password(password)
        if password_hash != user.get('passwordHash'):
            return build_response(401, {
                'message': 'Credenciales inválidas',
                'code': 'INVALID_CREDENTIALS'
            })
        
        print(f"[Auth] Login exitoso: {user['userId']} ({email})")
        
        # Generar token JWT
        token = generate_token(
            user['userId'],
            user['email'],
            user['role'],
            user.get('tenantId')
        )
        
        # Retornar respuesta
        return build_response(200, {
            'message': 'Login exitoso',
            'user': {
                'userId': user['userId'],
                'email': user['email'],
                'firstName': user.get('firstName'),
                'lastName': user.get('lastName'),
                'role': user['role'],
                'tenantId': user.get('tenantId')
            },
            'token': token
        })
        
    except Exception as e:
        print(f"[Auth] Error en login: {str(e)}")
        return build_response(500, {
            'message': 'Error al iniciar sesión',
            'code': 'LOGIN_ERROR',
            'details': str(e)
        })


def hash_password(password):
    """
    Hashea un password usando SHA256
    """
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


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
