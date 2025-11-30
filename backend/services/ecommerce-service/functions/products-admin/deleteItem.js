/**
 * Lambda: DELETE /menu/items/{itemId}
 * Roles: ADMIN_SEDE
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { getItem, deleteItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, notFound, forbidden, serverError } = require('../../shared/utils/response');

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    const productId = event.pathParameters.itemId;
    
    const product = await getItem(PRODUCTS_TABLE, { productId });
    
    if (!product) {
      return notFound('Producto no encontrado');
    }
    
    if (product.tenant_id !== user.tenant_id) {
      return forbidden('No puedes eliminar productos de otra sede');
    }
    
    await deleteItem(PRODUCTS_TABLE, { productId });
    
    return success({ message: 'Producto eliminado' });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al eliminar producto', error);
  }
};
