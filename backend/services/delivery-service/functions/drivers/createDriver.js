/**
 * Lambda: POST /delivery/drivers
 * Roles: Admin Sede
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { putItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, forbidden, serverError } = require('../../shared/utils/response');
const { v4: uuidv4 } = require('uuid');

const DRIVERS_TABLE = process.env.DRIVERS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    if (!user.tenant_id) {
      return forbidden('tenant_id requerido');
    }
    
    const body = JSON.parse(event.body);
    
    const driver = {
      driverId: uuidv4(),
      userId: body.userId,
      name: body.name,
      vehicleType: body.vehicleType || 'moto',
      tenant_id: user.tenant_id,
      isAvailable: true,
      currentDeliveries: 0,
      createdAt: new Date().toISOString()
    };
    
    await putItem(DRIVERS_TABLE, driver);
    
    return success({ driver });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al crear driver', error);
  }
};
