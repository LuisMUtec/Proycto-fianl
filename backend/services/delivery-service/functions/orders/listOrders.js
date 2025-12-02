const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { query } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, forbidden, serverError } = require('../../shared/utils/response');
const ORDERS_TABLE = process.env.ORDERS_TABLE;

/**
 * GET /delivery/orders - Listar órdenes de delivery para el driver
 * Roles: Repartidor
 */
exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    if (!user || user.role !== USER_ROLES.REPARTIDOR) {
      return forbidden('Solo repartidores pueden ver sus órdenes');
    }
    // Opcional: filtrar por estado si se pasa como query param
    const status = event.queryStringParameters?.status;
    let filterExpression = 'assignedDriverId = :driverId';
    let expressionValues = { ':driverId': user.userId };
    let indexName = 'driver-index';
    if (status) {
      filterExpression += ' AND #status = :status';
      expressionValues[':status'] = status;
      indexName = 'driver-status-index';
    }
    const orders = await query(
      ORDERS_TABLE,
      filterExpression,
      expressionValues,
      indexName,
      { '#status': 'status' }
    );
    return success({ orders });
  } catch (err) {
    console.error('Error:', err);
    return serverError('Error al listar órdenes', err);
  }
};
