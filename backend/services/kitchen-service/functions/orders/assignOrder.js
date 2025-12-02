/**
 * Lambda: POST /kitchen/orders/{orderId}/assign
 * Roles: Chef Ejecutivo
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { getItem, updateItem } = require('../../shared/database/dynamodb-client');
const { publishEvent } = require('../../shared/utils/eventbridge-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, error, forbidden } = require('../../shared/utils/response');

const ORDERS_TABLE = process.env.ORDERS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.CHEF_EJECUTIVO]);
    
    const { orderId } = event.pathParameters;
    const body = JSON.parse(event.body);
    const { chefId } = body;
    if (!chefId) return error('chefId requerido');
    const order = await getItem(ORDERS_TABLE, { orderId });
    if (!order) return error('Orden no encontrada');
    await updateItem(
      ORDERS_TABLE,
      { orderId },
      'SET assignedChef = :chefId, status = :cooking, updatedAt = :updatedAt',
      {
        ':chefId': chefId,
        ':cooking': 'COOKING',
        ':updatedAt': new Date().toISOString()
      }
    );
    await publishEvent('OrderAssigned', { orderId, chefId }, 'fridays.kitchen');
    
    return success({ message: 'Orden asignada al chef', chefId });
  } catch (err) {
    console.error('Error:', err);
    return error('Error al asignar la orden');
  }
};
