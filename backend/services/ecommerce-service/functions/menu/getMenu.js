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
    
    // Scan products (en producción usar query con GSI)
    const products = await scan(PRODUCTS_TABLE, 'isAvailable = :available', {
      ':available': true
    }, limit);
    
    return success({ products, page, limit });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al obtener menú', error);
  }
};
