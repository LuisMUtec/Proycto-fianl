/**
 * Lambda: PUT /admin/products/{productId}
 * Roles: Admin Sede
 * 
 * Actualiza un producto existente del tenant del usuario
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { getItem, updateItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, badRequest, notFound, forbidden, serverError } = require('../../shared/utils/response');

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || 'Products-dev';

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    const productId = decodeURIComponent(event.pathParameters.productId);
    const body = JSON.parse(event.body);
    
    // Verificar que el producto existe
    const existingProduct = await getItem(PRODUCTS_TABLE, { productId });
    if (!existingProduct) {
      return notFound('Producto no encontrado');
    }
    
    // Verificar que pertenece al tenant del usuario
    if (existingProduct.tenant_id !== user.tenant_id) {
      return forbidden('No tienes acceso a este producto');
    }
    
    // No permitir cambiar productId ni tenant_id
    if (body.productId || body.tenant_id) {
      return badRequest('No se puede cambiar productId ni tenant_id');
    }
    
    // Preparar campos actualizables
    const allowedFields = [
      'name', 'description', 'category', 'price', 'currency',
      'preparationTimeMinutes', 'isAvailable', 'imageUrl', 'imageKey',
      'tags', 'nutritionalInfo'
    ];
    
    const updates = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'price' || field === 'preparationTimeMinutes') {
          updates[field] = parseFloat(body[field]);
        } else {
          updates[field] = body[field];
        }
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return badRequest('No hay campos para actualizar');
    }
    
    updates.updatedAt = new Date().toISOString();
    
    // Construir UpdateExpression
    const updateExpressions = [];
    const expressionValues = {};
    const expressionNames = {};
    
    Object.keys(updates).forEach((key, index) => {
      const attrName = `#attr${index}`;
      const attrValue = `:val${index}`;
      expressionNames[attrName] = key;
      expressionValues[attrValue] = updates[key];
      updateExpressions.push(`${attrName} = ${attrValue}`);
    });
    
    const updateExpression = `SET ${updateExpressions.join(', ')}`;
    
    const updatedProduct = await updateItem(
      PRODUCTS_TABLE,
      { productId },
      updateExpression,
      expressionValues,
      expressionNames
    );
    
    return success({ 
      product: updatedProduct,
      message: 'Producto actualizado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al actualizar producto', error);
  }
};
