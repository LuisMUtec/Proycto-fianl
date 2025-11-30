/**
 * Lambda: POST /kitchen/orders/{orderId}/assign
 * Roles: Chef Ejecutivo
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { getItem, updateItem } = require('../../shared/database/dynamodb-client');
const { publishEvent } = require('../../shared/utils/eventbridge-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, notFound, badRequest, serverError } = require('../../shared/utils/response');

const ORDERS_TABLE = process.env.ORDERS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.CHEF_EJECUTIVO]);
    
    const orderId = event.pathParameters.orderId;
    const body = JSON.parse(event.body);
    
    if (!body.chefId) {
      return badRequest('chefId requerido');
    }
    
    const order = await getItem(ORDERS_TABLE, { orderId });
    
    if (!order) {
      return notFound('Orden no encontrada');
    }
    
    const updated = await updateItem(
      ORDERS_TABLE,
      { orderId },
      'SET #status = :status, assignedChefId = :chefId, updatedAt = :updatedAt',
      {
        ':status': 'COOKING',
        ':chefId': body.chefId,
        ':updatedAt': new Date().toISOString()
      },
      { '#status': 'status' }
    );
    
    await publishEvent('OrderAssigned', { orderId, chefId: body.chefId }, 'fridays.kitchen');
    
    return success({ order: updated });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al asignar orden', error);
  }
};
