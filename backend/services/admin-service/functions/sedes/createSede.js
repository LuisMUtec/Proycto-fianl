/**
 * Lambda: POST /admin/sedes
 * Roles: Admin Sede
 * 
 * Crear o actualizar información de una sede (tenant)
 * El tenant_id debe ser especificado en el body (ej: TENANT#001, TENANT#002)
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { putItem, getItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, badRequest, serverError } = require('../../shared/utils/response');

const TENANTS_TABLE = process.env.TENANTS_TABLE || 'Tenants-dev';

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    const body = JSON.parse(event.body);
    
    // Validar tenant_id
    if (!body.tenant_id) {
      return badRequest('tenant_id es requerido (ejemplo: TENANT#001)');
    }
    
    // Validar formato de tenant_id
    if (!/^TENANT#\d{3}$/.test(body.tenant_id)) {
      return badRequest('tenant_id debe tener el formato TENANT#XXX (ejemplo: TENANT#001)');
    }
    
    // Validar campos requeridos
    if (!body.name || !body.district || !body.address || !body.phone || !body.email) {
      return badRequest('name, district, address, phone y email son requeridos');
    }
    
    if (!body.latitude || !body.longitude) {
      return badRequest('latitude y longitude son requeridos');
    }
    
    // Verificar si el tenant ya existe
    const existingTenant = await getItem(TENANTS_TABLE, { tenant_id: body.tenant_id });
    const isUpdate = !!existingTenant;
    
    const sedeData = {
      tenant_id: body.tenant_id,
      name: body.name,
      district: body.district,
      address: body.address,
      latitude: parseFloat(body.latitude),
      longitude: parseFloat(body.longitude),
      phone: body.phone,
      email: body.email,
      status: body.status || 'ACTIVE',
      updatedAt: new Date().toISOString()
    };
    
    // Si es nuevo, agregar createdAt
    if (!isUpdate) {
      sedeData.createdAt = new Date().toISOString();
    } else {
      sedeData.createdAt = existingTenant.createdAt;
    }
    
    await putItem(TENANTS_TABLE, sedeData);
    
    return success({ 
      sede: sedeData,
      message: isUpdate 
        ? `Sede ${body.tenant_id} actualizada exitosamente` 
        : `Sede ${body.tenant_id} creada exitosamente`
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al crear/actualizar sede', error);
  }
};
