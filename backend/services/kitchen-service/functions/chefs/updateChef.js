const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { updateItem, getItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, forbidden, notFound, serverError } = require('../../shared/utils/response');

const USERS_TABLE = process.env.USERS_TABLE;

/**
 * PUT /kitchen/chefs/{chefId} - Actualizar chef
 * Roles: Chef Ejecutivo, Admin Sede
 */
exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.CHEF_EJECUTIVO, USER_ROLES.ADMIN_SEDE]);
    const { chefId } = event.pathParameters;
    const body = JSON.parse(event.body);
    const chef = await getItem(USERS_TABLE, { userId: chefId });
    if (!chef || chef.role !== USER_ROLES.CHEF_EJECUTIVO) {
      return notFound('Chef no encontrado');
    }
    if (chef.tenant_id !== user.tenant_id) {
      return forbidden('No tienes acceso a este chef');
    }
    await updateItem(
      USERS_TABLE,
      { userId: chefId },
      'SET #name = :name, #email = :email, updatedAt = :updatedAt',
      {
        ':name': body.name || chef.name,
        ':email': body.email || chef.email,
        ':updatedAt': new Date().toISOString()
      },
      { '#name': 'name', '#email': 'email' }
    );
    return success({ message: 'Chef actualizado' });
  } catch (err) {
    console.error('Error:', err);
    return serverError('Error al actualizar chef', err);
  }
};
