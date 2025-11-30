// Mock Auth Middleware - Solo para desarrollo local
// Simula autenticación sin necesidad de JWT real

/**
 * Middleware que inyecta un usuario fake en local
 * Para pruebas sin necesidad del servicio de AUTH
 */
const mockAuth = (handler) => {
  return async (event, context) => {
    const stage = process.env.STAGE || 'local';
    
    // Solo aplicar mock en ambiente local
    if (stage === 'local') {
      console.log('🔓 Mock Auth: Inyectando usuario de prueba');
      
      // Inyectar usuario fake en el event
      event.requestContext = event.requestContext || {};
      event.requestContext.authorizer = {
        userId: 'mock-user-123',
        email: 'test@fridays.pe',
        role: getMockRole(event.path),
        tenantId: 'TENANT#001'
      };
    }
    
    // Ejecutar el handler original
    return handler(event, context);
  };
};

/**
 * Determinar rol mock basado en el path
 * Para probar diferentes permisos
 */
function getMockRole(path) {
  if (path.includes('/admin')) {
    return 'ADMIN_SEDE';
  }
  if (path.includes('/delivery')) {
    return 'REPARTIDOR';
  }
  if (path.includes('/kitchen')) {
    return 'COCINERO';
  }
  return 'CLIENTE';
}

/**
 * Validar que el usuario tenga el rol requerido
 */
const requireRole = (allowedRoles) => {
  return (handler) => {
    return async (event, context) => {
      const user = event.requestContext?.authorizer;
      
      if (!user) {
        return {
          statusCode: 401,
          body: JSON.stringify({ error: 'Unauthorized' })
        };
      }

      if (!allowedRoles.includes(user.role)) {
        return {
          statusCode: 403,
          body: JSON.stringify({ error: 'Forbidden - Insufficient permissions' })
        };
      }

      return handler(event, context);
    };
  };
};

module.exports = {
  mockAuth,
  requireRole
};
