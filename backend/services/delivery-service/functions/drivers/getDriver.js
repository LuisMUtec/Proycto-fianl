/**
 * Lambda: GET /delivery/drivers/{driverId}
 * Roles: Admin Sede
 * 
 * Obtiene un driver específico del tenant del usuario
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { getItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, notFound, forbidden, serverError } = require('../../shared/utils/response');

const DRIVERS_TABLE = process.env.DRIVERS_TABLE || 'Drivers-dev';

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    const driverId = event.pathParameters.driverId;
    
    const driver = await getItem(DRIVERS_TABLE, { driverId });
    
    if (!driver) {
      return notFound('Driver no encontrado');
    }
    
    // Verificar que pertenece al tenant del usuario
    if (driver.tenant_id !== user.tenant_id) {
      return forbidden('No tienes acceso a este driver');
    }
    
    return success({ driver });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al obtener driver', error);
  }
};
