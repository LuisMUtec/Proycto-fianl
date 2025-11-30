/**
 * Lambda: PUT /delivery/drivers/{driverId}
 * Roles: Admin Sede
 * 
 * Actualiza un driver del tenant del usuario
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { getItem, updateItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, badRequest, notFound, forbidden, serverError } = require('../../shared/utils/response');

const DRIVERS_TABLE = process.env.DRIVERS_TABLE || 'Drivers-dev';

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    const driverId = event.pathParameters.driverId;
    const body = JSON.parse(event.body);
    
    // Verificar que el driver existe
    const existingDriver = await getItem(DRIVERS_TABLE, { driverId });
    if (!existingDriver) {
      return notFound('Driver no encontrado');
    }
    
    // Verificar que pertenece al tenant del usuario
    if (existingDriver.tenant_id !== user.tenant_id) {
      return forbidden('No tienes acceso a este driver');
    }
    
    // No permitir cambiar driverId ni tenant_id
    if (body.driverId || body.tenant_id) {
      return badRequest('No se puede cambiar driverId ni tenant_id');
    }
    
    // Preparar campos actualizables
    const allowedFields = ['name', 'vehicleType', 'isAvailable', 'currentDeliveries', 'phone', 'licensePlate'];
    const updates = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
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
    
    const updatedDriver = await updateItem(
      DRIVERS_TABLE,
      { driverId },
      updateExpression,
      expressionValues,
      expressionNames
    );
    
    return success({ 
      driver: updatedDriver,
      message: 'Driver actualizado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al actualizar driver', error);
  }
};
