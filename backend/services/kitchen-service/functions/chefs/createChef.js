/**
 * Lambda: POST /kitchen/chefs
 * Roles: Chef Ejecutivo, Admin Sede
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { putItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, forbidden, serverError } = require('../../shared/utils/response');
const { v4: uuidv4 } = require('uuid');

const CHEFS_TABLE = process.env.CHEFS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.CHEF_EJECUTIVO, USER_ROLES.ADMIN_SEDE]);
    
    if (!user.tenant_id) {
      return forbidden('tenant_id requerido');
    }
    
    const body = JSON.parse(event.body);
    
    const chef = {
      chefId: uuidv4(),
      userId: body.userId,
      name: body.name,
      tenant_id: user.tenant_id,
      isAvailable: true,
      currentOrders: 0,
      createdAt: new Date().toISOString()
    };
    
    await putItem(CHEFS_TABLE, chef);
    
    return success({ chef });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al crear chef', error);
  }
};
