/**
 * Lambda: PUT /menu/items/{itemId}/availability
 * Roles: ADMIN_SEDE
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { getItem, updateItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, notFound, forbidden, badRequest, serverError } = require('../../shared/utils/response');

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    const productId = event.pathParameters.itemId;
    const body = JSON.parse(event.body);
    
    if (typeof body.isAvailable !== 'boolean') {
      return badRequest('isAvailable debe ser boolean');
    }
    
    const product = await getItem(PRODUCTS_TABLE, { productId });
    
    if (!product) {
      return notFound('Producto no encontrado');
    }
    
    if (product.tenant_id !== user.tenant_id) {
      return forbidden('No puedes modificar productos de otra sede');
    }
    
    const updated = await updateItem(
      PRODUCTS_TABLE,
      { productId },
      'SET isAvailable = :isAvailable, updatedAt = :updatedAt',
      {
        ':isAvailable': body.isAvailable,
        ':updatedAt': new Date().toISOString()
      }
    );
    
    return success({ product: updated });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al actualizar disponibilidad', error);
  }
};
