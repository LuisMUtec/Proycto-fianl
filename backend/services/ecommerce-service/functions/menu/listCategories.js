/**
 * Lambda: GET /menu/categories
 * Roles: PUBLIC
 */

const { scan } = require('../../shared/database/dynamodb-client');
const { success, serverError } = require('../../shared/utils/response');

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;

module.exports.handler = async (event) => {
  try {
    const products = await scan(PRODUCTS_TABLE);
    const categories = [...new Set(products.map(p => p.category))];
    
    return success({ categories });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al obtener categorías', error);
  }
};
