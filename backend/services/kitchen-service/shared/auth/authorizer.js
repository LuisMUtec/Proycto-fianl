/**
 * Shared Auth Authorizer para API Gateway
 * 
 * ⚠️ SEGURIDAD:
 * - NO incluye credenciales hardcodeadas
 * - Valida JWT con tenant_id obligatorio
 * - Compatible con AWS Academy
 */

const { verifyToken } = require('./jwt-utils');

/**
 * Lambda Authorizer para API Gateway
 * Valida JWT tokens en el header Authorization
 */
module.exports.handler = async (event) => {
  console.log('🔐 Auth Request:', {
    methodArn: event.methodArn,
    hasToken: !!event.authorizationToken,
    headers: event.headers
  });

  try {
    // Extraer token del header (REQUEST authorizer usa event.headers)
    let authHeader = event.authorizationToken;
    
    // Si no está en authorizationToken, buscar en headers
    if (!authHeader && event.headers) {
      authHeader = event.headers.Authorization || event.headers.authorization;
    }
    
    const token = extractToken(authHeader);
    
    if (!token) {
      console.error('❌ No token provided');
      throw new Error('No token provided');
    }

    // Verificar y decodificar JWT (incluye validación de tenant_id)
    const decoded = await verifyToken(token);
    
    console.log('✅ Token válido:', {
      userId: decoded.userId,
      role: decoded.role,
      tenant_id: decoded.tenant_id
    });

    // Validar tenant_id para usuarios staff (no Cliente)
    if (decoded.role !== 'Cliente' && !decoded.tenant_id) {
      console.error('❌ Staff user sin tenant_id');
      throw new Error('tenant_id requerido');
    }

    // Generar policy de acceso
    const policy = generatePolicy(decoded.userId, 'Allow', event.methodArn, {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      tenant_id: decoded.tenant_id || 'null'
    });
    
    console.log('📋 Policy generada:', JSON.stringify(policy, null, 2));
    
    return policy;

  } catch (error) {
    console.error('❌ Auth Error:', error.message);
    
    // Retornar Deny si el token es inválido
    throw new Error('Unauthorized');
  }
};

/**
 * Extraer token del header Authorization
 */
function extractToken(authHeader) {
  if (!authHeader) {
    return null;
  }

  // Formato: "Bearer <token>"
  const parts = authHeader.split(' ');
  
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }

  // Si no tiene "Bearer", asumir que es solo el token
  return parts[0];
}

/**
 * Generar IAM Policy para API Gateway
 */
function generatePolicy(principalId, effect, resource, context) {
  const authResponse = {
    principalId
  };

  if (effect && resource) {
    // Usar wildcard para permitir acceso a todos los recursos del API
    // Extraer el ARN base del resource
    // De: arn:aws:execute-api:region:account:api-id/stage/METHOD/path/*
    // A:  arn:aws:execute-api:region:account:api-id/*
    const arnParts = resource.split(':');
    const apiGatewayArn = arnParts.slice(0, 5).join(':') + ':*';
    
    authResponse.policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: apiGatewayArn
        }
      ]
    };
  }

  // Context se pasa a la función Lambda en event.requestContext.authorizer
  if (context) {
    authResponse.context = context;
  }

  return authResponse;
}
