/**
 * Lambda: DELETE /delivery/drivers/{driverId}
 * Roles: Admin Sede
 * 
 * Elimina (soft delete) un driver del tenant del usuario
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
    
    // Verificar que el driver existe
    const driver = await getItem(DRIVERS_TABLE, { driverId });
    if (!driver) {
      return notFound('Driver no encontrado');
    }
    
    // Verificar que pertenece al tenant del usuario
    if (driver.tenant_id !== user.tenant_id) {
      return forbidden('No tienes acceso a este driver');
    }
    
    // Verificar que no tenga entregas activas
    if (driver.currentDeliveries > 0) {
      return badRequest(`No se puede eliminar el driver porque tiene ${driver.currentDeliveries} entregas activas`);
    }
    
    // Soft delete: marcar como no disponible
    const updatedDriver = await updateItem(
      DRIVERS_TABLE,
      { driverId },
      'SET #isAvailable = :isAvailable, #updatedAt = :updatedAt, #deletedAt = :deletedAt',
      {
        ':isAvailable': false,
        ':updatedAt': new Date().toISOString(),
        ':deletedAt': new Date().toISOString()
      },
      {
        '#isAvailable': 'isAvailable',
        '#updatedAt': 'updatedAt',
        '#deletedAt': 'deletedAt'
      }
    );
    
    return success({ 
      driver: updatedDriver,
      message: 'Driver eliminado exitosamente (marcado como no disponible)'
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al eliminar driver', error);
  }
};
