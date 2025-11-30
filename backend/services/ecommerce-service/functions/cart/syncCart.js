/**
 * Lambda: POST /cart/sync
 * Roles: CLIENTE
 */

const { getUserFromEvent } = require('../../shared/auth/jwt-utils');
const { putItem } = require('../../shared/database/dynamodb-client');
const { success, serverError } = require('../../shared/utils/response');

const CARTS_TABLE = process.env.CARTS_TABLE || process.env.ORDERS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    const body = JSON.parse(event.body);
    
    const cart = {
      userId: user.userId,
      items: body.items || [],
      updatedAt: new Date().toISOString()
    };
    
    await putItem(CARTS_TABLE, cart);
    
    return success({ cart });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al sincronizar carrito', error);
  }
};
