/**
 * Lambda: DELETE /admin/sedes/{tenant_id}
 * Roles: Admin Sede
 * 
 * Desactiva una sede (soft delete cambiando status a INACTIVE)
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { getItem, updateItem, query } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, badRequest, notFound, serverError } = require('../../shared/utils/response');

const TENANTS_TABLE = process.env.TENANTS_TABLE || 'Tenants-dev';
const USERS_TABLE = process.env.USERS_TABLE || 'Users-dev';

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    // Decodificar tenant_id de la URL (convierte %23 a #)
    const tenant_id = decodeURIComponent(event.pathParameters.tenant_id);
    
    console.log('🗑️ Eliminando sede:', tenant_id);
    
    // Verificar que la sede existe
    const sede = await getItem(TENANTS_TABLE, { tenant_id });
    if (!sede) {
      return notFound('Sede no encontrada');
    }
    
    // Verificar si hay usuarios activos en esta sede
    const usersInSede = await query(
      USERS_TABLE,
      'tenant_id = :tenant_id',
      { ':tenant_id': tenant_id },
      'tenant_id-role-index'
    );
    
    if (usersInSede && usersInSede.length > 0) {
      return badRequest(`No se puede eliminar la sede porque tiene ${usersInSede.length} usuarios asociados`);
    }
    
    // Soft delete: cambiar status a INACTIVE
    const updatedSede = await updateItem(
      TENANTS_TABLE, 
      { tenant_id },
      'SET #status = :status, #deletedAt = :deletedAt, #updatedAt = :updatedAt',
      {
        ':status': 'INACTIVE',
        ':deletedAt': new Date().toISOString(),
        ':updatedAt': new Date().toISOString()
      },
      {
        '#status': 'status',
        '#deletedAt': 'deletedAt',
        '#updatedAt': 'updatedAt'
      }
    );
    
    return success({ 
      sede: updatedSede,
      message: 'Sede desactivada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al eliminar sede', error);
  }
};
