/**
 * Lambda: GET /menu/{category}
 * Roles: PUBLIC/CLIENTE
 */

const { query } = require('../../shared/database/dynamodb-client');
const { success, serverError } = require('../../shared/utils/response');

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;

module.exports.handler = async (event) => {
  try {
    const category = decodeURIComponent(event.pathParameters.category);
    
    // TODO: En producción, obtener tenant_id del contexto/header
    // Por ahora usamos un tenant por defecto
    const tenant_id = 'TENANT#001';
    
    const products = await query(
      PRODUCTS_TABLE,
      'tenant_id = :tenant_id AND category = :category',
      { ':tenant_id': tenant_id, ':category': category },
      'tenant_id-category-index'
    );
    
    // Filtrar solo disponibles
    const availableProducts = products.filter(p => p.isAvailable);
    
    return success({ category, products: availableProducts, count: availableProducts.length });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al obtener categoría', error);
  }
};
