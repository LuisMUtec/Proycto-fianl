/**
 * Validation Utilities
 * Helper para validación de datos
 */

/**
 * Validar campos requeridos
 */
function validateRequiredFields(data, fields) {
  const errors = [];

  for (const field of fields) {
    if (!data[field]) {
      errors.push(`Campo requerido: ${field}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  return true;
}

/**
 * Validar email
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validar teléfono peruano
 */
function validatePhone(phone) {
  // Formato: +51XXXXXXXXX o 9XXXXXXXX
  const phoneRegex = /^(\+51)?9\d{8}$/;
  return phoneRegex.test(phone);
}

/**
 * Validar UUID
 */
function validateUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitizar input de usuario
 */
function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input.trim().replace(/<script>/gi, '');
  }
  return input;
}

/**
 * Validar ownership: usuario solo puede acceder a sus recursos
 */
function validateOwnership(userId, resourceOwnerId) {
  if (userId !== resourceOwnerId) {
    throw new Error('No tienes permiso para acceder a este recurso');
  }
  return true;
}

/**
 * Validar tenant_id: staff solo puede acceder a su sede
 */
function validateTenantAccess(userTenantId, resourceTenantId) {
  if (userTenantId !== resourceTenantId) {
    throw new Error('No tienes permiso para acceder a recursos de otra sede');
  }
  return true;
}

module.exports = {
  validateRequiredFields,
  validateEmail,
  validatePhone,
  validateUUID,
  sanitizeInput,
  validateOwnership,
  validateTenantAccess
};
