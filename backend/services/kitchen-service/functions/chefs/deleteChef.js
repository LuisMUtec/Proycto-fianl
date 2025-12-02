const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { deleteItem, getItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, forbidden, notFound, serverError } = require('../../shared/utils/response');

const USERS_TABLE = process.env.USERS_TABLE;

/**
 * DELETE /kitchen/chefs/{chefId} - Eliminar chef
 * Roles: Chef Ejecutivo, Admin Sede
 */
exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.CHEF_EJECUTIVO, USER_ROLES.ADMIN_SEDE]);
    const { chefId } = event.pathParameters;
    const chef = await getItem(USERS_TABLE, { userId: chefId });
    if (!chef || chef.role !== USER_ROLES.CHEF_EJECUTIVO) {
      return notFound('Chef no encontrado');
    }
    if (chef.tenant_id !== user.tenant_id) {
      return forbidden('No tienes acceso a este chef');
    }
    await deleteItem(USERS_TABLE, { userId: chefId });
    return success({ message: 'Chef eliminado' });
  } catch (err) {
    console.error('Error:', err);
    return serverError('Error al eliminar chef', err);
  }
};
