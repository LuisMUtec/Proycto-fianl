const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { getItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, forbidden, notFound, serverError } = require('../../shared/utils/response');
const ORDERS_TABLE = process.env.ORDERS_TABLE;

/**
 * GET /delivery/orders/{orderId} - Obtener orden de delivery asignada al driver
 * Roles: Repartidor
 */
exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    if (!user || user.role !== USER_ROLES.REPARTIDOR) {
      return forbidden('Solo repartidores pueden ver sus órdenes');
    }
    const { orderId } = event.pathParameters;
    const order = await getItem(ORDERS_TABLE, { orderId });
    if (!order) return notFound('Orden no encontrada');
    if (order.assignedDriverId !== user.userId) {
      return forbidden('No tienes acceso a esta orden');
    }
    return success({ order });
  } catch (err) {
    console.error('Error:', err);
    return serverError('Error al obtener la orden', err);
  }
};
