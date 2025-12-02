const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { deleteItem, getItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, forbidden, notFound, serverError } = require('../../shared/utils/response');
const ORDERS_TABLE = process.env.ORDERS_TABLE;

/**
 * DELETE /delivery/orders/{orderId} - Eliminar orden de delivery (solo si está asignada al driver y en estado CANCELLED)
 * Roles: Repartidor
 */
exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    if (!user || user.role !== USER_ROLES.REPARTIDOR) {
      return forbidden('Solo repartidores pueden eliminar sus órdenes');
    }
    const { orderId } = event.pathParameters;
    const order = await getItem(ORDERS_TABLE, { orderId });
    if (!order) return notFound('Orden no encontrada');
    if (order.assignedDriverId !== user.userId) {
      return forbidden('No tienes acceso a esta orden');
    }
    if (order.status !== 'CANCELLED') {
      return forbidden('Solo se pueden eliminar órdenes canceladas');
    }
    await deleteItem(ORDERS_TABLE, { orderId });
    return success({ message: 'Orden eliminada' });
  } catch (err) {
    console.error('Error:', err);
    return serverError('Error al eliminar la orden', err);
  }
};
