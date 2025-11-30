/**
 * Lambda: DELETE /cart
 * Roles: CLIENTE
 */

const { getUserFromEvent } = require('../../shared/auth/jwt-utils');
const { deleteItem } = require('../../shared/database/dynamodb-client');
const { success, serverError } = require('../../shared/utils/response');

const CARTS_TABLE = process.env.CARTS_TABLE || process.env.ORDERS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    
    await deleteItem(CARTS_TABLE, { userId: user.userId });
    
    return success({ message: 'Carrito limpiado' });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al limpiar carrito', error);
  }
};
