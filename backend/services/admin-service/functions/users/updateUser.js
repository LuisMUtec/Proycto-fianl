/**
 * Lambda: PUT /admin/users/{userId}
 * Roles: Admin Sede
 */

const bcrypt = require('bcryptjs');
const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { getItem, updateItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, notFound, forbidden, serverError } = require('../../shared/utils/response');

const USERS_TABLE = process.env.USERS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    const { userId } = event.pathParameters;
    const body = JSON.parse(event.body);
    
    // Verificar que el usuario existe
    const targetUser = await getItem(USERS_TABLE, { userId });
    
    if (!targetUser) {
      return notFound('Usuario no encontrado');
    }
    
    // Verificar que el usuario pertenece al mismo tenant
    if (targetUser.tenant_id !== user.tenant_id) {
      return forbidden('No tienes acceso a este usuario');
    }
    
    // Construir expresiones de actualización
    const updateExpressions = [];
    const expressionValues = {};
    const expressionNames = {};
    
    // Soportar tanto "name" como "firstName/lastName"
    if (body.name) {
      const parts = body.name.trim().split(' ');
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ') || parts[0];
      
      updateExpressions.push('#firstName = :firstName');
      expressionNames['#firstName'] = 'firstName';
      expressionValues[':firstName'] = firstName;
      
      updateExpressions.push('#lastName = :lastName');
      expressionNames['#lastName'] = 'lastName';
      expressionValues[':lastName'] = lastName;
    } else {
      if (body.firstName) {
        updateExpressions.push('#firstName = :firstName');
        expressionNames['#firstName'] = 'firstName';
        expressionValues[':firstName'] = body.firstName;
      }
      
      if (body.lastName) {
        updateExpressions.push('#lastName = :lastName');
        expressionNames['#lastName'] = 'lastName';
        expressionValues[':lastName'] = body.lastName;
      }
    }
    
    if (body.email) {
      updateExpressions.push('#email = :email');
      expressionNames['#email'] = 'email';
      expressionValues[':email'] = body.email;
    }
    
    if (body.role) {
      updateExpressions.push('#role = :role');
      expressionNames['#role'] = 'role';
      expressionValues[':role'] = body.role;
    }
    
    if (body.address) {
      updateExpressions.push('#address = :address');
      expressionNames['#address'] = 'address';
      expressionValues[':address'] = body.address;
    }
    
    if (body.phoneNumber) {
      updateExpressions.push('#phoneNumber = :phoneNumber');
      expressionNames['#phoneNumber'] = 'phoneNumber';
      expressionValues[':phoneNumber'] = body.phoneNumber;
    }
    
    if (body.status) {
      updateExpressions.push('#status = :status');
      expressionNames['#status'] = 'status';
      expressionValues[':status'] = body.status;
    }
    
    if (body.password) {
      const passwordHash = await bcrypt.hash(body.password, 10);
      updateExpressions.push('#passwordHash = :passwordHash');
      expressionNames['#passwordHash'] = 'passwordHash';
      expressionValues[':passwordHash'] = passwordHash;
    }
    
    // Agregar updatedAt
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionNames['#updatedAt'] = 'updatedAt';
    expressionValues[':updatedAt'] = new Date().toISOString();
    
    if (updateExpressions.length === 0) {
      return success({ message: 'No hay campos para actualizar' });
    }
    
    await updateItem(
      USERS_TABLE,
      { userId },
      `SET ${updateExpressions.join(', ')}`,
      expressionValues,
      expressionNames
    );
    
    // Obtener usuario actualizado
    const updatedUser = await getItem(USERS_TABLE, { userId });
    const { passwordHash, ...userWithoutPassword } = updatedUser;
    
    return success({ user: userWithoutPassword });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al actualizar usuario', error);
  }
};
