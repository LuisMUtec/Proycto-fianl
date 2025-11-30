/**
 * Lambda: GET /admin/users
 * Roles: Admin Sede
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { query } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, forbidden, serverError } = require('../../shared/utils/response');

const USERS_TABLE = process.env.USERS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    if (!user.tenant_id) {
      return forbidden('tenant_id requerido');
    }
    
    const users = await query(
      USERS_TABLE,
      'tenant_id = :tenant_id',
      { ':tenant_id': user.tenant_id },
      'tenant_id-role-index'
    );
    
    // Remover passwords
    const usersWithoutPassword = users.map(u => {
      const { passwordHash, ...rest } = u;
      return rest;
    });
    
    return success({ users: usersWithoutPassword });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al listar usuarios', error);
  }
};
