/**
 * Lambda: GET /menu?page&limit
 * Roles: PUBLIC/CLIENTE
 */

const { query, scan } = require('../../shared/database/dynamodb-client');
const { success, badRequest, serverError } = require('../../shared/utils/response');

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;

module.exports.handler = async (event) => {
  try {
    const page = parseInt(event.queryStringParameters?.page || '1');
    const limit = parseInt(event.queryStringParameters?.limit || '20');
    const tenant_id = event.queryStringParameters?.tenant_id;

    let filterExpression = 'isAvailable = :available';
    let expressionValues = { ':available': true };
    if (tenant_id) {
      filterExpression += ' AND tenant_id = :tenant_id';
      expressionValues[':tenant_id'] = tenant_id;
    }

    // Scan products (en producción usar query con GSI)
    const products = await scan(PRODUCTS_TABLE, filterExpression, expressionValues, limit);

    return success({ products, page, limit, tenant_id });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al obtener menú', error);
  }
};
