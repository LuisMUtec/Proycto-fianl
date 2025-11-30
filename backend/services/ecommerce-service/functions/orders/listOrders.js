/**
 * Lambda: GET /orders
 * Roles: ADMIN_SEDE
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { query } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, forbidden, serverError } = require('../../shared/utils/response');

const ORDERS_TABLE = process.env.ORDERS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    if (!user.tenant_id) {
      return forbidden('tenant_id requerido');
    }
    
    const orders = await query(
      ORDERS_TABLE,
      'tenant_id = :tenant_id',
      { ':tenant_id': user.tenant_id },
      'tenant-index'
    );
    
    return success({ orders });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al listar órdenes', error);
  }
};
