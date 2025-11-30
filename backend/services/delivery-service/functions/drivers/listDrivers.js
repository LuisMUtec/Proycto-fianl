/**
 * Lambda: GET /delivery/drivers
 * Roles: Admin Sede
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { query } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, forbidden, serverError } = require('../../shared/utils/response');

const DRIVERS_TABLE = process.env.DRIVERS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    if (!user.tenant_id) {
      return forbidden('tenant_id requerido');
    }
    
    const drivers = await query(
      DRIVERS_TABLE,
      'tenant_id = :tenant_id',
      { ':tenant_id': user.tenant_id },
      'tenant_id-index'
    );
    
    return success({ drivers, count: drivers.length, tenant_id: user.tenant_id });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al listar drivers', error);
  }
};
