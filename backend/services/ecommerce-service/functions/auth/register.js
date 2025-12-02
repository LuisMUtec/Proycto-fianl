/**
 * Lambda: POST /auth/register
 * Roles: PUBLIC (Cliente)
 * 
 * ⚠️ SEGURIDAD:
 * - NO incluye credenciales hardcodeadas
 * - Usa módulos compartidos (sin credenciales)
 * - Valida datos de entrada
 * - Hash de contraseñas con bcrypt
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { putItem, query } = require('../../shared/database/dynamodb-client');
const { generateToken } = require('../../shared/auth/jwt-utils');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, badRequest, serverError } = require('../../shared/utils/response');
const { validateEmail, validateRequiredFields } = require('../../shared/utils/validation');

const USERS_TABLE = process.env.USERS_TABLE;

module.exports.handler = async (event) => {
  console.log('📝 Register request');

  try {
    // Manejar tanto event.body (API Gateway) como event directo (testing)
    const body = event.body ? JSON.parse(event.body) : event;

    // Validar campos requeridos
    validateRequiredFields(body, ['email', 'password', 'firstName', 'lastName', 'role']);

    const { email, password, firstName, lastName, phoneNumber, address, role, vehicleType, tenant_id } = body;

    // Validar email
    if (!validateEmail(email)) {
      return badRequest('Email inválido');
    }

    // Validar contraseña (mínimo 6 caracteres)
    if (password.length < 6) {
      return badRequest('La contraseña debe tener al menos 6 caracteres');
    }

    // Verificar si el email ya existe
    const existingUsers = await query(
      USERS_TABLE,
      'email = :email',
      { ':email': email },
      'email-index'
    );

    if (existingUsers && existingUsers.length > 0) {
      return badRequest('El email ya está registrado');
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const userId = uuidv4();
    const timestamp = new Date().toISOString();

    const newUser = {
      userId,
      email,
      passwordHash,
      firstName,
      lastName,
      phoneNumber: phoneNumber || null,
      address: address || null,
      role: role || USER_ROLES.CLIENTE,
      tenant_id: tenant_id || null,
      status: 'ACTIVE',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await putItem(USERS_TABLE, newUser);

    // Si el rol es REPARTIDOR, crear también en la tabla de drivers
    if (role === USER_ROLES.REPARTIDOR) {
      const DRIVERS_TABLE = process.env.DRIVERS_TABLE;
      const driver = {
        driverId: uuidv4(),
        userId,
        name: `${firstName} ${lastName}`,
        vehicleType: vehicleType || 'moto',
        tenant_id: tenant_id || null,
        isAvailable: true,
        currentDeliveries: 0,
        createdAt: timestamp
      };
      await putItem(DRIVERS_TABLE, driver);
    }

    // Si el rol es CHEF_EJECUTIVO o COCINERO, crear también en la tabla de chefs
    if (role === USER_ROLES.CHEF_EJECUTIVO || role === USER_ROLES.COCINERO) {
      const CHEFS_TABLE = process.env.CHEFS_TABLE;
      const chef = {
        chefId: uuidv4(),
        userId,
        name: `${firstName} ${lastName}`,
        tenant_id: tenant_id || null,
        isAvailable: true,
        currentOrders: 0,
        createdAt: timestamp
      };
    }

    console.log(`✅ Usuario registrado: ${userId}`);

    // Generar token JWT
    const token = await generateToken({
      userId: newUser.userId,
      email: newUser.email,
      role: newUser.role,
      tenant_id: newUser.tenant_id
    });

    // Respuesta sin la contraseña
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return success({
      user: userWithoutPassword,
      token
    }, 'Usuario registrado exitosamente');

  } catch (error) {
    console.error('❌ Register error:', error);
    return serverError('Error al registrar usuario', error);
  }
};
