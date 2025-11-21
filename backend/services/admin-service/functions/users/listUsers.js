const AWS = require('aws-sdk');
const { mockAuth } = require('../../../../shared/middlewares/mock-auth');
const { USER_ROLES } = require('../../../../shared/constants/user-roles');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const USERS_TABLE = process.env.USERS_TABLE;

async function listUsers(event) {
  try {
    const admin = event.requestContext.authorizer;

    // Solo ADMIN_SEDE puede listar usuarios
    if (admin.role !== USER_ROLES.ADMIN_SEDE) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'No tienes permisos' })
      };
    }

    // Obtener usuarios del tenant
    const result = await dynamodb.query({
      TableName: USERS_TABLE,
      IndexName: 'tenantId-role-index',
      KeyConditionExpression: 'tenantId = :tenantId',
      ExpressionAttributeValues: {
        ':tenantId': admin.tenantId
      }
    }).promise();

    // No retornar passwords
    const users = result.Items.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        data: users
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

module.exports.handler = mockAuth(listUsers);
