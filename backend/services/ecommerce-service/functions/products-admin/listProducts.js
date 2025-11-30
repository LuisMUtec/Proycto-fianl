const { success, error, forbidden } = require('../../shared/utils/response');
const { getItem, putItem, query, scan, updateItem, deleteItem } = require('../../shared/database/dynamodb-client');
const { validateOwnership, validateTenantAccess } = require('../../shared/utils/validation');

/**
 * GET /menu/productos - Admin list products
 */
exports.handler = async (event) => {
  try {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    // TODO: Implementar lógica de listProducts
    
    return success({ message: 'listProducts - Por implementar' });
    
  } catch (err) {
    console.error('Error:', err);
    return error(err.message || 'Error interno del servidor');
  }
};
