/**
 * Lambda: POST /auth/login
 * Roles: PUBLIC (Cliente)
 * 
 * ⚠️ SEGURIDAD:
 * - NO incluye credenciales hardcodeadas
 * - Usa módulos compartidos (sin credenciales)
 * - Valida contraseña con bcrypt
 * - Genera JWT con tenant_id
 */

const bcrypt = require('bcryptjs');
const { query } = require('../../shared/database/dynamodb-client');
const { generateToken } = require('../../shared/auth/jwt-utils');
const { success, badRequest, unauthorized, serverError } = require('../../shared/utils/response');
const { validateEmail, validateRequiredFields } = require('../../shared/utils/validation');

const USERS_TABLE = process.env.USERS_TABLE;

module.exports.handler = async (event) => {
  console.log('🔐 Login request');

  try {
    const body = JSON.parse(event.body);

    // Validar campos requeridos
    validateRequiredFields(body, ['email', 'password']);

    const { email, password } = body;

    // Validar email
    if (!validateEmail(email)) {
      return badRequest('Email inválido');
    }

    // Buscar usuario por email
    const users = await query(
      USERS_TABLE,
      'email = :email',
      { ':email': email },
      'email-index'
    );

    if (!users || users.length === 0) {
      return unauthorized('Credenciales inválidas');
    }

    const user = users[0];

    // Verificar si el usuario está activo
    if (user.status !== 'ACTIVE') {
      return unauthorized('Usuario inactivo');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return unauthorized('Credenciales inválidas');
    }

    console.log(`✅ Login exitoso: ${user.userId} (${user.role})`);

    // Generar token JWT con tenant_id
    const token = await generateToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id || null
    });

    // Respuesta sin la contraseña
    const { passwordHash: _, ...userWithoutPassword } = user;

    return success({
      user: userWithoutPassword,
      token
    }, 'Login exitoso');

  } catch (error) {
    console.error('❌ Login error:', error);
    return serverError('Error al iniciar sesión', error);
  }
};
