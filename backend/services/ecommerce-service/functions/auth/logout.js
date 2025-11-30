/**
 * Lambda: POST /auth/logout
 * Roles: AUTHENTICATED
 * 
 * ⚠️ NOTA:
 * - JWT es stateless, no se puede "invalidar" server-side
 * - Este endpoint es para confirmar logout del cliente
 * - Opcionalmente podríamos agregar token a blacklist en DynamoDB
 */

const { getUserFromEvent } = require('../../shared/auth/jwt-utils');
const { success, unauthorized, serverError } = require('../../shared/utils/response');

module.exports.handler = async (event) => {
  console.log('👋 Logout request');

  try {
    // Obtener usuario del authorizer
    const user = getUserFromEvent(event);

    if (!user) {
      return unauthorized('Token inválido');
    }

    console.log(`✅ Logout successful for user: ${user.userId}`);

    // TODO: Opcionalmente agregar token a blacklist en DynamoDB
    // para invalidar tokens antes de expiración

    return success({
      message: 'Logout exitoso'
    }, 'Sesión cerrada correctamente');

  } catch (error) {
    console.error('❌ Logout error:', error);
    return serverError('Error al cerrar sesión', error);
  }
};
