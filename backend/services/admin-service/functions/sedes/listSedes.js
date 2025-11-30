/**
 * Lambda: GET /admin/sedes
 * Roles: Admin Sede
 * 
 * Lista todas las sedes (tenants) del sistema
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { scan } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, serverError } = require('../../shared/utils/response');

const TENANTS_TABLE = process.env.TENANTS_TABLE || 'Tenants-dev';

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    const sedes = await scan(TENANTS_TABLE);
    
    return success({ 
      sedes,
      count: sedes.length 
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al listar sedes', error);
  }
};
