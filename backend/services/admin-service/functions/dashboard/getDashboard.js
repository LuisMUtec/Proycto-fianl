/**
 * Lambda: GET /admin/dashboard/{tenantId}
 * Roles: Admin Sede
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { query } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, forbidden, serverError } = require('../../shared/utils/response');

const ORDERS_TABLE = process.env.ORDERS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    // Usar el tenant_id del usuario autenticado (más seguro)
    const tenantId = user.tenant_id;
    
    if (!tenantId) {
      return forbidden('Usuario sin tenant asignado');
    }
    
    const orders = await query(
      ORDERS_TABLE,
      'tenant_id = :tenant_id',
      { ':tenant_id': tenantId },
      'tenant_id-status-index'
    );
    
    const stats = {
      totalOrders: orders.length,
      byStatus: orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {}),
      revenue: orders.reduce((sum, o) => sum + (o.total || 0), 0)
    };
    
    return success({ stats });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al obtener dashboard', error);
  }
};
