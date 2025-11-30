/**
 * Lambda: POST /auth/refresh-token
 * Roles: AUTHENTICATED
 * 
 * ⚠️ SEGURIDAD:
 * - NO incluye credenciales
 * - Valida token anterior
 * - Genera nuevo token con mismos claims
 */

const { verifyToken, generateToken, getUserFromEvent } = require('../../shared/auth/jwt-utils');
const { success, unauthorized, serverError } = require('../../shared/utils/response');

module.exports.handler = async (event) => {
  console.log('🔄 Refresh token request');

  try {
    // Obtener usuario del authorizer (token anterior)
    const user = getUserFromEvent(event);

    if (!user) {
      return unauthorized('Token inválido');
    }

    console.log(`✅ Refreshing token for user: ${user.userId}`);

    // Generar nuevo token con los mismos claims
    const newToken = await generateToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id
    });

    return success({
      token: newToken
    }, 'Token renovado exitosamente');

  } catch (error) {
    console.error('❌ Refresh token error:', error);
    return serverError('Error al renovar token', error);
  }
};
