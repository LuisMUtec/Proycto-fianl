/**
 * Lambda: POST /admin/products
 * Roles: Admin Sede
 * 
 * Crea un nuevo producto para el tenant del usuario
 * Soporte para carga de imágenes a S3
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { putItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, badRequest, serverError } = require('../../shared/utils/response');
const { v4: uuidv4 } = require('uuid');

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || 'Products-dev';
const S3_BUCKET = process.env.S3_BUCKET || 'fridays-product-images-dev';

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    const body = JSON.parse(event.body);
    
    // Validar campos requeridos
    if (!body.name || !body.category || !body.price) {
      return badRequest('name, category y price son requeridos');
    }
    
    const tenant_id = user.tenant_id;
    const productId = body.productId || `PRODUCT#${uuidv4().substring(0, 8).toUpperCase()}`;
    
    // Construir imageKey si no se proporciona
    const imageKey = body.imageKey || `images/${tenant_id.replace('#', '-').toLowerCase()}/${productId.toLowerCase()}.jpg`;
    
    const product = {
      productId,
      tenant_id,
      name: body.name,
      description: body.description || '',
      category: body.category,
      price: parseFloat(body.price),
      currency: body.currency || 'PEN',
      preparationTimeMinutes: body.preparationTimeMinutes ? parseInt(body.preparationTimeMinutes) : 0,
      isAvailable: body.isAvailable !== undefined ? body.isAvailable : true,
      imageUrl: body.imageUrl || `https://${S3_BUCKET}.s3.amazonaws.com/${imageKey}`,
      imageKey: imageKey,
      tags: body.tags || [],
      nutritionalInfo: body.nutritionalInfo || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await putItem(PRODUCTS_TABLE, product);
    
    return success({ 
      product,
      message: 'Producto creado exitosamente',
      s3UploadUrl: `https://${S3_BUCKET}.s3.amazonaws.com/${imageKey}`
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al crear producto', error);
  }
};
