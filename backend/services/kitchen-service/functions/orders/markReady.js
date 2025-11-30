/**
 * Lambda: POST /kitchen/orders/{orderId}/ready
 * Roles: Cocinero, Empacador
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { updateItem } = require('../../shared/database/dynamodb-client');
const { publishEvent } = require('../../shared/utils/eventbridge-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, serverError } = require('../../shared/utils/response');

const ORDERS_TABLE = process.env.ORDERS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.COCINERO, USER_ROLES.EMPACADOR]);
    
    const orderId = event.pathParameters.orderId;
    
    const updated = await updateItem(
      ORDERS_TABLE,
      { orderId },
      'SET #status = :status, readyAt = :readyAt, updatedAt = :updatedAt',
      {
        ':status': 'READY',
        ':readyAt': new Date().toISOString(),
        ':updatedAt': new Date().toISOString()
      },
      { '#status': 'status' }
    );
    
    await publishEvent('OrderReady', { orderId }, 'fridays.kitchen');
    
    return success({ order: updated });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al marcar orden lista', error);
  }
};
