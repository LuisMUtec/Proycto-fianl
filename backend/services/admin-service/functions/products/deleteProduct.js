/**
 * Lambda: DELETE /admin/products/{productId}
 * Roles: Admin Sede
 * 
 * Elimina (soft delete) un producto del tenant del usuario
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { getItem, updateItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, notFound, forbidden, serverError } = require('../../shared/utils/response');

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || 'Products-dev';

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    const productId = decodeURIComponent(event.pathParameters.productId);
    
    // Verificar que el producto existe
    const product = await getItem(PRODUCTS_TABLE, { productId });
    if (!product) {
      return notFound('Producto no encontrado');
    }
    
    // Verificar que pertenece al tenant del usuario
    if (product.tenant_id !== user.tenant_id) {
      return forbidden('No tienes acceso a este producto');
    }
    
    // Soft delete: marcar como no disponible
    const updatedProduct = await updateItem(
      PRODUCTS_TABLE,
      { productId },
      'SET #isAvailable = :isAvailable, #updatedAt = :updatedAt, #deletedAt = :deletedAt',
      {
        ':isAvailable': false,
        ':updatedAt': new Date().toISOString(),
        ':deletedAt': new Date().toISOString()
      },
      {
        '#isAvailable': 'isAvailable',
        '#updatedAt': 'updatedAt',
        '#deletedAt': 'deletedAt'
      }
    );
    
    return success({ 
      product: updatedProduct,
      message: 'Producto eliminado exitosamente (marcado como no disponible)'
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al eliminar producto', error);
  }
};
