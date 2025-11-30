/**
 * Lambda: GET /kitchen/chefs
 * Roles: Chef Ejecutivo, Admin Sede
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { query } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, forbidden, serverError } = require('../../shared/utils/response');

const CHEFS_TABLE = process.env.CHEFS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.CHEF_EJECUTIVO, USER_ROLES.ADMIN_SEDE]);
    
    if (!user.tenant_id) {
      return forbidden('tenant_id requerido');
    }
    
    const chefs = await query(
      CHEFS_TABLE,
      'tenant_id = :tenant_id',
      { ':tenant_id': user.tenant_id },
      'tenant-index'
    );
    
    return success({ chefs });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al listar chefs', error);
  }
};
