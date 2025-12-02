/**
 * Lambda: POST /delivery/orders/{orderId}/assign
 * Roles: Empacador
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
    validateAccess(user, [USER_ROLES.EMPACADOR]);
    
    const orderId = event.pathParameters.orderId;
    const body = JSON.parse(event.body);
    
    if (!body.driverId) {
      return badRequest('driverId requerido');
    }
    
    const order = await getItem(ORDERS_TABLE, { orderId });
    
    if (!order) {
      return notFound('Orden no encontrada');
    }
    
    const updated = await updateItem(
      ORDERS_TABLE,
      { orderId },
      'SET #status = :status, assignedDriverId = :driverId, updatedAt = :updatedAt',
      {
        ':status': 'DELIVERING',
        ':driverId': body.driverId,
        ':updatedAt': new Date().toISOString()
      },
      { '#status': 'status' }
    );
    
    await publishEvent('DriverAssigned', { orderId, driverId: body.driverId }, 'fridays.delivery');
    
    return success({ order: updated });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al asignar driver', error);
  }
};
