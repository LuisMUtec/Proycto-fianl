"""
Helper module para extraer y decodificar información de autenticación
desde el contexto del Lambda Authorizer.

Este módulo proporciona funciones reutilizables para acceder a la información
del usuario autenticado en cualquier Lambda protegido.

Uso:
    from shared.auth.auth_context import get_auth_context, require_role

    def lambda_handler(event, context):
        # Extraer información del usuario autenticado
        auth = get_auth_context(event)
        
        # Acceder a los datos del usuario
        user_id = auth['userId']
        role = auth['role']
        tenant_id = auth.get('tenantId')  # Opcional para role USER
        
        # Validar rol requerido
        require_role(auth, ['ADMIN', 'COOK'])  # Lanza exception si no tiene el rol
        
        # Tu lógica de negocio aquí
        ...
"""

from typing import Dict, List, Optional


class AuthorizationError(Exception):
    """Excepción lanzada cuando hay problemas de autorización"""
    pass


def get_auth_context(event: Dict) -> Dict[str, str]:
    """
    Extrae la información de autenticación del contexto del Lambda Authorizer.
    
    El Lambda Authorizer agrega información del usuario decodificado del JWT
    en event['requestContext']['authorizer'].
    
    Args:
        event: El evento de API Gateway que contiene el contexto del authorizer
        
    Returns:
        Dict con las siguientes claves:
        - userId: ID del usuario autenticado
        - email: Email del usuario
        - role: Rol del usuario (USER, COOK, DISPATCHER, ADMIN)
        - tenantId: ID del tenant (opcional, solo para roles de staff)
        
    Raises:
        AuthorizationError: Si no se encuentra información de autenticación
        
    Example:
        >>> auth = get_auth_context(event)
        >>> print(auth['userId'])
        'user-001'
        >>> print(auth['role'])
        'COOK'
    """
    try:
        authorizer = event.get('requestContext', {}).get('authorizer', {})
        
        if not authorizer:
            raise AuthorizationError("No se encontró información de autenticación en el contexto")
        
        # El authorizer agrega estos campos al contexto
        user_id = authorizer.get('userId')
        email = authorizer.get('email')
        role = authorizer.get('role')
        tenant_id = authorizer.get('tenantId')  # Puede ser None para usuarios USER
        
        if not user_id or not email or not role:
            raise AuthorizationError("Información de autenticación incompleta")
        
        auth_context = {
            'userId': user_id,
            'email': email,
            'role': role
        }
        
        # Agregar tenantId solo si existe
        if tenant_id:
            auth_context['tenantId'] = tenant_id
        
        return auth_context
        
    except KeyError as e:
        raise AuthorizationError(f"Error al extraer información de autenticación: {str(e)}")


def require_role(auth_context: Dict, allowed_roles: List[str]) -> None:
    """
    Valida que el usuario autenticado tenga uno de los roles permitidos.
    
    Args:
        auth_context: Contexto de autenticación obtenido con get_auth_context()
        allowed_roles: Lista de roles permitidos (e.g., ['ADMIN', 'COOK'])
        
    Raises:
        AuthorizationError: Si el usuario no tiene un rol permitido
        
    Example:
        >>> auth = get_auth_context(event)
        >>> require_role(auth, ['ADMIN'])  # OK si el usuario es ADMIN
        >>> require_role(auth, ['COOK', 'DISPATCHER'])  # OK si es COOK o DISPATCHER
        >>> require_role(auth, ['ADMIN'])  # Lanza error si el usuario es USER
    """
    user_role = auth_context.get('role')
    
    if user_role not in allowed_roles:
        raise AuthorizationError(
            f"Acceso denegado. Rol requerido: {', '.join(allowed_roles)}. "
            f"Tu rol: {user_role}"
        )


def require_tenant(auth_context: Dict) -> str:
    """
    Valida que el usuario autenticado tenga un tenantId y lo retorna.
    
    Args:
        auth_context: Contexto de autenticación obtenido con get_auth_context()
        
    Returns:
        El tenantId del usuario autenticado
        
    Raises:
        AuthorizationError: Si el usuario no tiene un tenantId
        
    Example:
        >>> auth = get_auth_context(event)
        >>> tenant_id = require_tenant(auth)
        >>> print(tenant_id)
        'sede-quito-001'
    """
    tenant_id = auth_context.get('tenantId')
    
    if not tenant_id:
        raise AuthorizationError(
            "Esta operación requiere estar asociado a un tenant. "
            "Los usuarios con rol USER no pueden realizar esta acción."
        )
    
    return tenant_id


def is_admin(auth_context: Dict) -> bool:
    """
    Verifica si el usuario autenticado es un administrador.
    
    Args:
        auth_context: Contexto de autenticación obtenido con get_auth_context()
        
    Returns:
        True si el usuario tiene rol ADMIN, False en caso contrario
        
    Example:
        >>> auth = get_auth_context(event)
        >>> if is_admin(auth):
        >>>     print("Usuario es administrador")
    """
    return auth_context.get('role') == 'ADMIN'


def is_staff(auth_context: Dict) -> bool:
    """
    Verifica si el usuario autenticado es staff (COOK, DISPATCHER, o ADMIN).
    
    Args:
        auth_context: Contexto de autenticación obtenido con get_auth_context()
        
    Returns:
        True si el usuario es staff, False si es un cliente USER
        
    Example:
        >>> auth = get_auth_context(event)
        >>> if is_staff(auth):
        >>>     print("Usuario es miembro del staff")
    """
    role = auth_context.get('role')
    return role in ['COOK', 'DISPATCHER', 'ADMIN']


def validate_tenant_access(auth_context: Dict, resource_tenant_id: str) -> None:
    """
    Valida que el usuario tenga acceso a un recurso de un tenant específico.
    
    Los usuarios con rol USER pueden acceder a recursos de cualquier tenant.
    Los usuarios staff solo pueden acceder a recursos de su propio tenant.
    
    Args:
        auth_context: Contexto de autenticación obtenido con get_auth_context()
        resource_tenant_id: TenantId del recurso al que se intenta acceder
        
    Raises:
        AuthorizationError: Si el usuario no tiene acceso al tenant del recurso
        
    Example:
        >>> auth = get_auth_context(event)
        >>> order_tenant_id = order['tenantId']
        >>> validate_tenant_access(auth, order_tenant_id)
    """
    user_role = auth_context.get('role')
    user_tenant_id = auth_context.get('tenantId')
    
    # Los usuarios USER pueden ordenar de cualquier tenant
    if user_role == 'USER':
        return
    
    # Los usuarios staff solo pueden acceder a recursos de su tenant
    if user_tenant_id != resource_tenant_id:
        raise AuthorizationError(
            f"No tienes permiso para acceder a recursos del tenant {resource_tenant_id}. "
            f"Tu tenant es {user_tenant_id}"
        )


def get_auth_user_id(event: Dict) -> str:
    """
    Atajo para obtener directamente el userId del usuario autenticado.
    
    Args:
        event: El evento de API Gateway
        
    Returns:
        El userId del usuario autenticado
        
    Example:
        >>> user_id = get_auth_user_id(event)
        >>> print(user_id)
        'user-001'
    """
    auth = get_auth_context(event)
    return auth['userId']


def get_auth_role(event: Dict) -> str:
    """
    Atajo para obtener directamente el role del usuario autenticado.
    
    Args:
        event: El evento de API Gateway
        
    Returns:
        El role del usuario autenticado
        
    Example:
        >>> role = get_auth_role(event)
        >>> print(role)
        'ADMIN'
    """
    auth = get_auth_context(event)
    return auth['role']


def get_auth_tenant_id(event: Dict) -> Optional[str]:
    """
    Atajo para obtener directamente el tenantId del usuario autenticado.
    
    Args:
        event: El evento de API Gateway
        
    Returns:
        El tenantId del usuario autenticado, o None si es un usuario USER
        
    Example:
        >>> tenant_id = get_auth_tenant_id(event)
        >>> if tenant_id:
        >>>     print(f"Tenant: {tenant_id}")
    """
    auth = get_auth_context(event)
    return auth.get('tenantId')
