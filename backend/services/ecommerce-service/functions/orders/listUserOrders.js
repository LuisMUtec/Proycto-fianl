/**
 * Lambda: GET /users/orders
 * Roles: CLIENTE
 */

const { getUserFromEvent } = require('../../shared/auth/jwt-utils');
const { query } = require('../../shared/database/dynamodb-client');
const { success, serverError } = require('../../shared/utils/response');

const ORDERS_TABLE = process.env.ORDERS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    
    const orders = await query(
      ORDERS_TABLE,
      'userId = :userId',
      { ':userId': user.userId },
      'user-index'
    );
    
    return success({ orders });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al listar órdenes', error);
  }
};
