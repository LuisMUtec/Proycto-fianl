/**
 * Lambda: POST /cart/validate
 * Roles: Cliente
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { getItem } = require('../../shared/database/dynamodb-client');
const AWS = require('aws-sdk');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, badRequest, serverError } = require('../../shared/utils/response');

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;
const CARTS_TABLE = process.env.CARTS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    // Solo validar el rol, no el tenant_id en el usuario
    if (user.role !== USER_ROLES.CLIENTE) {
      return badRequest('Acceso denegado: solo clientes pueden validar carrito');
    }

    const { tenant_id } = JSON.parse(event.body);
    if (!tenant_id) {
      return badRequest('tenant_id es requerido');
    }

    // Obtener carrito del usuario
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const cartResult = await dynamodb.get({
      TableName: CARTS_TABLE,
      Key: { userId: user.userId }
    }).promise();

    if (!cartResult.Item || !cartResult.Item.items || cartResult.Item.items.length === 0) {
      return badRequest('Carrito vacío');
    }

    const validatedItems = [];
    let total = 0;

    for (const item of cartResult.Item.items) {
      const product = await getItem(PRODUCTS_TABLE, { productId: item.productId });
      if (!product) {
        validatedItems.push({
          ...item,
          valid: false,
          reason: `Producto ${item.productId} no encontrado`,
        });
        continue;
      }
      if (!product.isAvailable) {
        validatedItems.push({
          ...item,
          product,
          valid: false,
          reason: `Producto ${product.name} no disponible`,
        });
        continue;
      }
      if (product.tenant_id && product.tenant_id !== tenant_id) {
        validatedItems.push({
          ...item,
          product,
          valid: false,
          reason: `Producto ${product.name} no pertenece a la sede seleccionada`,
        });
        continue;
      }
      const subtotal = product.price * item.quantity;
      validatedItems.push({ ...item, product, subtotal, valid: true });
      total += subtotal;
    }

    return success({ validatedItems, total });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al validar carrito', error);
  }
};
