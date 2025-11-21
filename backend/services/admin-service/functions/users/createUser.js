const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { mockAuth } = require('../../../../shared/middlewares/mock-auth');
const { USER_ROLES, isValidRole } = require('../../../../shared/constants/user-roles');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const USERS_TABLE = process.env.USERS_TABLE;

async function createUser(event) {
  try {
    const admin = event.requestContext.authorizer;
    const { firstName, lastName, email, phoneNumber, password, role } = JSON.parse(event.body);

    // Solo ADMIN_SEDE puede crear usuarios
    if (admin.role !== USER_ROLES.ADMIN_SEDE) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'No tienes permisos' })
      };
    }

    // Validar datos requeridos
    if (!firstName || !lastName || !email || !phoneNumber || !password || !role) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'Faltan datos requeridos' })
      };
    }

    // Validar rol
    if (!isValidRole(role)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'Rol inválido' })
      };
    }

    // Verificar que el email no existe
    const existingUser = await dynamodb.query({
      TableName: USERS_TABLE,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    }).promise();

    if (existingUser.Items.length > 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'El email ya está registrado' })
      };
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = {
      userId: uuidv4(),
      tenantId: role === USER_ROLES.CLIENTE ? null : admin.tenantId,
      role,
      firstName,
      lastName,
      email,
      phoneNumber,
      passwordHash,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dynamodb.put({
      TableName: USERS_TABLE,
      Item: newUser
    }).promise();

    // No retornar el passwordHash
    delete newUser.passwordHash;

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        data: newUser
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, error: 'Error interno del servidor' })
    };
  }
}

module.exports.handler = mockAuth(createUser);
