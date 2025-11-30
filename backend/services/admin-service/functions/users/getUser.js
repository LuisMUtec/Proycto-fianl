/**
 * Lambda: GET /admin/users/{userId}
 * Roles: Admin Sede
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { getItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, notFound, forbidden, serverError } = require('../../shared/utils/response');

const USERS_TABLE = process.env.USERS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    const { userId } = event.pathParameters;
    
    const targetUser = await getItem(USERS_TABLE, { userId });
    
    if (!targetUser) {
      return notFound('Usuario no encontrado');
    }
    
    // Verificar que el usuario pertenece al mismo tenant
    if (targetUser.tenant_id !== user.tenant_id) {
      return forbidden('No tienes acceso a este usuario');
    }
    
    // Remover password
    const { passwordHash, ...userWithoutPassword } = targetUser;
    
    return success({ user: userWithoutPassword });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al obtener usuario', error);
  }
};
