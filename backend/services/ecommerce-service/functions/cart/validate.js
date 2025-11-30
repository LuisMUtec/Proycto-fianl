/**
 * Lambda: POST /cart/validate
 * Roles: Cliente
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { getItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, badRequest, serverError } = require('../../shared/utils/response');

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.CLIENTE]);

    const { items } = JSON.parse(event.body);
    
    const validatedItems = [];
    let total = 0;

    for (const item of items) {
      const product = await getItem(PRODUCTS_TABLE, { productId: item.productId });
      
      if (!product) {
        return badRequest(`Producto ${item.productId} no encontrado`);
      }
      
      if (!product.isAvailable) {
        return badRequest(`Producto ${product.name} no disponible`);
      }

      const subtotal = product.price * item.quantity;
      validatedItems.push({ ...item, product, subtotal });
      total += subtotal;
    }

    return success({ validatedItems, total });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al validar carrito', error);
  }
};
