/**
 * Lambda: PUT /menu/items/{itemId}
 * Roles: ADMIN_SEDE
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { getItem, updateItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, notFound, forbidden, serverError } = require('../../shared/utils/response');

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    const productId = event.pathParameters.itemId;
    const body = JSON.parse(event.body);
    
    const product = await getItem(PRODUCTS_TABLE, { productId });
    
    if (!product) {
      return notFound('Producto no encontrado');
    }
    
    if (product.tenant_id !== user.tenant_id) {
      return forbidden('No puedes editar productos de otra sede');
    }
    
    const updated = await updateItem(
      PRODUCTS_TABLE,
      { productId },
      'SET #name = :name, description = :description, price = :price, updatedAt = :updatedAt',
      {
        ':name': body.name || product.name,
        ':description': body.description || product.description,
        ':price': body.price || product.price,
        ':updatedAt': new Date().toISOString()
      },
      { '#name': 'name' }
    );
    
    return success({ product: updated });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al actualizar producto', error);
  }
};
