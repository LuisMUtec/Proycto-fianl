/**
 * Lambda: GET /admin/sedes/{tenant_id}
 * Roles: Admin Sede
 * 
 * Obtiene información detallada de una sede específica
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { getItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, notFound, serverError } = require('../../shared/utils/response');

const TENANTS_TABLE = process.env.TENANTS_TABLE || 'Tenants-dev';

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    // Decodificar tenant_id de la URL (convierte %23 a #)
    const tenant_id = decodeURIComponent(event.pathParameters.tenant_id);
    
    console.log('🔍 Buscando sede:', tenant_id);
    
    const sede = await getItem(TENANTS_TABLE, { tenant_id });
    
    if (!sede) {
      return notFound('Sede no encontrada');
    }
    
    return success({ sede });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al obtener sede', error);
  }
};
