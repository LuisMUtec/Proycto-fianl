const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { query } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, forbidden, serverError } = require('../../shared/utils/response');
const ORDERS_TABLE = process.env.ORDERS_TABLE;

/**
 * GET /kitchen/orders - Listar todas las órdenes de la cocina (por tenant)
 * Roles: Chef Ejecutivo, Cocinero, Empacador
 */
exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    // Solo staff de cocina puede ver todas las órdenes
    if (!user || !user.tenant_id || !USER_ROLES.isKitchenStaff(user.role)) {
      return forbidden('Acceso restringido a staff de cocina');
    }
    // Opcional: filtrar por estado si se pasa como query param
    const status = event.queryStringParameters?.status;
    let filterExpression = 'tenant_id = :tenant_id';
    let expressionValues = { ':tenant_id': user.tenant_id };
    let indexName = 'tenant-index';
    if (status) {
      filterExpression += ' AND #status = :status';
      expressionValues[':status'] = status;
      indexName = 'tenant-status-index';
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
