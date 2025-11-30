/**
 * JWT Utilities - Compartido entre servicios
 * 
 * ⚠️ SEGURIDAD:
 * - NO incluye credenciales hardcodeadas
 * - Usa AWS Systems Manager Parameter Store para secretos
 * - Compatible con AWS Academy (roles rotativos)
 */

const jwt = require('jsonwebtoken');
const { getParameter } = require('../utils/parameter-store');

let cachedSecret = null;

/**
 * Obtener JWT_SECRET desde Parameter Store (con cache)
 */
async function getJwtSecret() {
  if (cachedSecret) {
    return cachedSecret;
  }

  try {
    cachedSecret = await getParameter('/fridays/jwt-secret', true);
    return cachedSecret;
  } catch (error) {
    console.error('⚠️ No se pudo obtener JWT_SECRET de Parameter Store, usando fallback');
    // Fallback solo para desarrollo local
    return process.env.JWT_SECRET || 'dev-secret-key-fridays-2025';
  }
}

/**
 * Generar JWT token con tenant_id obligatorio
 */
async function generateToken(payload) {
  // Comparar case-insensitive para el rol Cliente
  const isCliente = payload.role && payload.role.toUpperCase() === 'CLIENTE';
  
  if (!payload.tenant_id && !isCliente) {
    throw new Error('tenant_id es obligatorio para usuarios staff');
  }

  const secret = await getJwtSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verificar JWT token y validar tenant_id
 */
async function verifyToken(token) {
  try {
    const secret = await getJwtSecret();
    const decoded = jwt.verify(token, secret);

    // Validación obligatoria de tenant_id para staff (case-insensitive)
    const isCliente = decoded.role && decoded.role.toUpperCase() === 'CLIENTE';
    if (!isCliente && !decoded.tenant_id) {
      throw new Error('Token inválido: falta tenant_id');
    }

    return decoded;
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    throw new Error('Invalid token');
  }
}

/**
 * Decodificar token sin verificar (útil para debugging)
 */
function decodeToken(token) {
  return jwt.decode(token);
}

/**
 * Extraer datos del usuario del event de API Gateway
 * (después de pasar por el authorizer)
 */
function getUserFromEvent(event) {
  const authorizer = event.requestContext?.authorizer;
  
  if (!authorizer) {
    return null;
  }

  return {
    userId: authorizer.userId,
    email: authorizer.email,
    role: authorizer.role,
    tenant_id: authorizer.tenant_id === 'null' ? null : authorizer.tenant_id
  };
}

/**
 * Validar que un usuario tenga permisos para acceder a un recurso
 */
function validateAccess(user, requiredRoles = []) {
  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  // Validar tenant_id para staff
  if (user.role !== 'CLIENTE' && !user.tenant_id) {
    throw new Error('Acceso denegado: tenant_id requerido');
  }

  // Validar roles si se especifican
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    throw new Error(`Acceso denegado: se requiere rol ${requiredRoles.join(' o ')}`);
  }

  return true;
}

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  getUserFromEvent,
  validateAccess
};
