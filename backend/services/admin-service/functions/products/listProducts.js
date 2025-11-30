/**
 * Lambda: GET /admin/products
 * Roles: Admin Sede
 * 
 * Lista todos los productos del tenant del usuario autenticado
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { query } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, serverError } = require('../../shared/utils/response');

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || 'Products-dev';

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    const tenant_id = user.tenant_id;
    const { category, available } = event.queryStringParameters || {};
    
    let products;
    
    if (category) {
      // Buscar por tenant y categoría
      products = await query(
        PRODUCTS_TABLE,
        'tenant_id = :tenant_id AND category = :category',
        { ':tenant_id': tenant_id, ':category': category },
        'tenant_id-category-index'
      );
    } else {
      // Buscar todos los productos del tenant
      products = await query(
        PRODUCTS_TABLE,
        'tenant_id = :tenant_id',
        { ':tenant_id': tenant_id },
        'tenant_id-category-index'
      );
    }
    
    // Filtrar por disponibilidad si se especifica
    if (available === 'true') {
      products = products.filter(p => p.isAvailable);
    } else if (available === 'false') {
      products = products.filter(p => !p.isAvailable);
    }
    
    return success({ 
      products,
      count: products.length,
      tenant_id 
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al listar productos', error);
  }
};
