/**
 * Lambda: POST /menu/productos
 * Roles: ADMIN_SEDE
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { putItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, badRequest, forbidden, serverError } = require('../../shared/utils/response');
const { v4: uuidv4 } = require('uuid');

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    if (!user.tenant_id) {
      return forbidden('tenant_id requerido');
    }
    
    const body = JSON.parse(event.body);
    
    const product = {
      productId: uuidv4(),
      name: body.name,
      description: body.description,
      category: body.category,
      price: body.price,
      imageUrl: body.imageUrl || null,
      isAvailable: true,
      tenant_id: user.tenant_id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await putItem(PRODUCTS_TABLE, product);
    
    return success({ product });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al crear producto', error);
  }
};
