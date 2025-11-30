/**
 * Lambda: GET /menu/items/{itemId}
 * Roles: PUBLIC/CLIENTE
 */

const { getItem } = require('../../shared/database/dynamodb-client');
const { success, badRequest, notFound, serverError } = require('../../shared/utils/response');

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;

module.exports.handler = async (event) => {
  try {
    // Soportar tanto query parameter (?id=) como path parameter (/items/{itemId})
    let productId = event.queryStringParameters?.id || event.pathParameters?.itemId;
    
    if (!productId) {
      return badRequest('Parámetro id requerido');
    }
    
    // Decodificar URL (por si viene con %23 en lugar de #)
    productId = decodeURIComponent(productId);
    
    console.log('🔍 Buscando producto:', productId);
    
    const product = await getItem(PRODUCTS_TABLE, { productId });
    
    if (!product) {
      console.log('❌ Producto no encontrado:', productId);
      return notFound('Producto no encontrado');
    }
    
    return success({ product });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al obtener producto', error);
  }
};
