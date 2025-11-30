/**
 * Lambda: DELETE /admin/users/{userId}
 * Roles: Admin Sede
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { getItem, deleteItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, notFound, forbidden, serverError } = require('../../shared/utils/response');

const USERS_TABLE = process.env.USERS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    const { userId } = event.pathParameters;
    
    // Verificar que el usuario existe
    const targetUser = await getItem(USERS_TABLE, { userId });
    
    if (!targetUser) {
      return notFound('Usuario no encontrado');
    }
    
    // Verificar que el usuario pertenece al mismo tenant
    if (targetUser.tenant_id !== user.tenant_id) {
      return forbidden('No tienes acceso a este usuario');
    }
    
    // No permitir que se elimine a sí mismo
    if (targetUser.userId === user.userId) {
      return forbidden('No puedes eliminarte a ti mismo');
    }
    
    await deleteItem(USERS_TABLE, { userId });
    
    return success({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al eliminar usuario', error);
  }
};
