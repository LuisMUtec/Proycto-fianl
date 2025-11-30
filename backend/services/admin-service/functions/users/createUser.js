/**
 * Lambda: POST /admin/users
 * Roles: Admin Sede
 */

const bcrypt = require('bcryptjs');
const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { putItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, badRequest, forbidden, serverError } = require('../../shared/utils/response');
const { v4: uuidv4 } = require('uuid');

const USERS_TABLE = process.env.USERS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    const body = JSON.parse(event.body);
    
    // Validar campos requeridos
    if (!body.email || !body.password || !body.role) {
      return badRequest('email, password y role son requeridos');
    }
    
    if (!body.name && (!body.firstName || !body.lastName)) {
      return badRequest('Debe proporcionar name o firstName/lastName');
    }
    
    if (!body.address || !body.phoneNumber) {
      return badRequest('address y phoneNumber son requeridos');
    }
    
    if (!user.tenant_id) {
      return forbidden('tenant_id requerido');
    }
    
    // Soportar tanto "name" como "firstName/lastName"
    let firstName, lastName;
    if (body.name) {
      const parts = body.name.trim().split(' ');
      firstName = parts[0]; 
      lastName = parts.slice(1).join(' ') || parts[0];
    } else {
      firstName = body.firstName;
      lastName = body.lastName;
    }
    
    const passwordHash = await bcrypt.hash(body.password, 10);
    
    // Permitir especificar tenant_id en el body, por defecto usar el del admin
    const targetTenantId = body.tenant_id || user.tenant_id;
    
    const newUser = {
      userId: uuidv4(),
      email: body.email,
      passwordHash,
      firstName,
      lastName,
      role: body.role,
      tenant_id: targetTenantId,
      address: body.address,
      phoneNumber: body.phoneNumber,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    
    await putItem(USERS_TABLE, newUser);
    
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    
    return success({ user: userWithoutPassword });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al crear usuario', error);
  }
};
