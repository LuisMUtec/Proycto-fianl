/**
 * Roles de usuarios del sistema Fridays Perú
 * 
 * @description Define todos los roles posibles según arquitectura
 * IMPORTANTE: Estos valores deben coincidir exactamente en toda la aplicación
 * 
 * Roles definidos:
 * - Cliente: Cliente final (no requiere tenant_id)
 * - Cheff Ejecutivo: Supervisa cocina y asigna pedidos (requiere tenant_id)
 * - Cocinero: Prepara pedidos (requiere tenant_id)
 * - Empacador: Empaca y asigna a delivery (requiere tenant_id)
 * - Repartidor: Entrega pedidos (requiere tenant_id)
 * - Admin Sede: Administrador de sede (requiere tenant_id)
 */

module.exports = {
  USER_ROLES: {
    CLIENTE: 'Cliente',
    CHEF_EJECUTIVO: 'Cheff Ejecutivo',
    COCINERO: 'Cocinero',
    EMPACADOR: 'Empacador',
    REPARTIDOR: 'Repartidor',
    ADMIN_SEDE: 'Admin Sede'
  },

  // Helper: Verificar si un rol es válido
  isValidRole: (role) => {
    return Object.values(module.exports.USER_ROLES).includes(role);
  },

  // Helper: Roles que pertenecen al staff de cocina
  isKitchenStaff: (role) => {
    return [
      module.exports.USER_ROLES.CHEF_EJECUTIVO,
      module.exports.USER_ROLES.COCINERO,
      module.exports.USER_ROLES.EMPACADOR
    ].includes(role);
  },

  // Helper: Roles administrativos
  isAdmin: (role) => {
    return [
      module.exports.USER_ROLES.ADMIN_SEDE,
      module.exports.USER_ROLES.CHEF_EJECUTIVO
    ].includes(role);
  },

  // Helper: Roles que pueden ver todos los pedidos de la sede
  canViewAllOrders: (role) => {
    return [
      module.exports.USER_ROLES.ADMIN_SEDE,
      module.exports.USER_ROLES.CHEF_EJECUTIVO
    ].includes(role);
  },

  // Helper: Roles de staff (requieren tenant_id)
  requiresTenantId: (role) => {
    return role !== module.exports.USER_ROLES.CLIENTE;
  }
};
