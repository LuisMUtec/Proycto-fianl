/**
 * Lambda: GET /admin/orders/today
 * Roles: Admin Sede
 * 
 * Obtiene todas las órdenes del día actual para el tenant del usuario
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { query } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, serverError } = require('../../shared/utils/response');

const ORDERS_TABLE = process.env.ORDERS_TABLE || 'Orders-dev';

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);

    const tenant_id = user.tenant_id;
    const today = new Date().toISOString().split('T')[0];
    
    const orders = await query(
      ORDERS_TABLE,
      'tenant_id = :tenant_id AND begins_with(createdAt, :today)',
      {
        ':tenant_id': tenant_id,
        ':today': today
      },
      'tenant_id-createdAt-index'
    );

    return success({
      orders,
      count: orders.length,
      date: today
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al obtener órdenes de hoy', error);
  }
};
