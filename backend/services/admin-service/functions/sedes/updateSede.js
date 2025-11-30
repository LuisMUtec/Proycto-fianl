/**
 * Lambda: PUT /admin/sedes/{tenant_id}
 * Roles: Admin Sede
 * 
 * Actualiza información de una sede (NO permite cambiar tenant_id)
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { getItem, updateItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, badRequest, notFound, serverError } = require('../../shared/utils/response');

const TENANTS_TABLE = process.env.TENANTS_TABLE || 'Tenants-dev';

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    // Decodificar tenant_id de la URL (convierte %23 a #)
    const tenant_id = decodeURIComponent(event.pathParameters.tenant_id);
    const body = JSON.parse(event.body);
    
    console.log('🔄 Actualizando sede:', tenant_id);
    
    // No permitir cambiar el tenant_id
    if (body.tenant_id && body.tenant_id !== tenant_id) {
      return badRequest('No se puede cambiar el tenant_id de una sede');
    }
    
    // Verificar que la sede existe
    const existingSede = await getItem(TENANTS_TABLE, { tenant_id });
    if (!existingSede) {
      return notFound('Sede no encontrada');
    }
    
    // Preparar campos actualizables
    const allowedFields = ['name', 'district', 'address', 'phone', 'email', 'latitude', 'longitude', 'status'];
    const updates = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'latitude' || field === 'longitude') {
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
    
    const updatedSede = await updateItem(
      TENANTS_TABLE, 
      { tenant_id }, 
      updateExpression, 
      expressionValues, 
      expressionNames
    );
    
    return success({ 
      sede: updatedSede,
      message: 'Sede actualizada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al actualizar sede', error);
  }
};
