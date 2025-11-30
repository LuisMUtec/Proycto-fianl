/**
 * Lambda: GET /admin/products/{productId}
 * Roles: Admin Sede
 * 
 * Obtiene un producto específico del tenant del usuario
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { getItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, notFound, forbidden, serverError } = require('../../shared/utils/response');

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || 'Products-dev';

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    const productId = decodeURIComponent(event.pathParameters.productId);
    
    const product = await getItem(PRODUCTS_TABLE, { productId });
    
    if (!product) {
      return notFound('Producto no encontrado');
    }
    
    // Verificar que el producto pertenece al tenant del usuario
    if (product.tenant_id !== user.tenant_id) {
      return forbidden('No tienes acceso a este producto');
    }
    
    return success({ product });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al obtener producto', error);
  }
};
