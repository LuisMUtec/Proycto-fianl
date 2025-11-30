/**
 * Lambda: PUT /orders/{orderId}/cancel
 * Roles: CLIENTE/ADMIN_SEDE
 */

const { getUserFromEvent } = require('../../shared/auth/jwt-utils');
const { getItem, updateItem } = require('../../shared/database/dynamodb-client');
const { publishEvent } = require('../../shared/utils/eventbridge-client');
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
    
    // Validar ownership
    if (user.role === USER_ROLES.CLIENTE && order.userId !== user.userId) {
      return forbidden('No puedes cancelar esta orden');
    }
    
    const updated = await updateItem(
      ORDERS_TABLE,
      { orderId },
      'SET #status = :status, updatedAt = :updatedAt',
      { ':status': 'CANCELLED', ':updatedAt': new Date().toISOString() },
      { '#status': 'status' }
    );
    
    await publishEvent('OrderCancelled', { orderId, userId: user.userId }, 'fridays.orders');
    
    return success({ order: updated });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al cancelar orden', error);
  }
};
