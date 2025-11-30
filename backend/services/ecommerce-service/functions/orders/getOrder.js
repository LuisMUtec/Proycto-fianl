/**
 * Lambda: GET /orders/{orderId}
 * Roles: CLIENTE (owner) / ADMIN_SEDE
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { getItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, notFound, forbidden, serverError } = require('../../shared/utils/response');

const ORDERS_TABLE = process.env.ORDERS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    const orderId = event.pathParameters.orderId;
    
    const order = await getItem(ORDERS_TABLE, { orderId });
    
    if (!order) {
      return notFound('Orden no encontrada');
    }
    
    // Validar ownership o admin
    if (user.role === USER_ROLES.CLIENTE && order.userId !== user.userId) {
      return forbidden('No tienes permiso para ver esta orden');
    }
    
    if (user.role === USER_ROLES.ADMIN_SEDE && order.tenant_id !== user.tenant_id) {
      return forbidden('No tienes permiso para ver esta orden');
    }
    
    return success({ order });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al obtener orden', error);
  }
};
