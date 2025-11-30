/**
 * Lambda: PUT /kitchen/orders/{orderId}
 * Roles: Cocinero
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { updateItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, serverError } = require('../../shared/utils/response');

const ORDERS_TABLE = process.env.ORDERS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.COCINERO]);
    
    const orderId = event.pathParameters.orderId;
    const body = JSON.parse(event.body);
    
    const updated = await updateItem(
      ORDERS_TABLE,
      { orderId },
      'SET notes = :notes, updatedAt = :updatedAt',
      {
        ':notes': body.notes || '',
        ':updatedAt': new Date().toISOString()
      }
    );
    
    return success({ order: updated });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al actualizar orden', error);
  }
};
