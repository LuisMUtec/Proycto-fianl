const { success, error } = require('../../shared/utils/response');
const { getItem } = require('../../shared/database/dynamodb-client');
const ORDERS_TABLE = process.env.ORDERS_TABLE;

/**
 * GET /kitchen/orders/{{orderId}} - Obtener orden específica
 */
exports.handler = async (event) => {
  try {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    const { orderId } = event.pathParameters;
    const order = await getItem(ORDERS_TABLE, { orderId });
    if (!order) return error('Orden no encontrada');
    return success({ order });
    
  } catch (err) {
    console.error('Error:', err);
    return error('Error al obtener la orden');
  }
};
