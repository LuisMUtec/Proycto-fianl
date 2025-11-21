const AWS = require('aws-sdk');
const { mockAuth } = require('../../../../shared/middlewares/mock-auth');
const { USER_ROLES } = require('../../../../shared/constants/user-roles');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const TENANTS_TABLE = process.env.TENANTS_TABLE;

async function listSedes(event) {
  try {
    const user = event.requestContext.authorizer;

    // Solo ADMIN_SEDE puede ver sedes
    if (user.role !== USER_ROLES.ADMIN_SEDE) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'No tienes permisos' })
      };
    }

    const result = await dynamodb.scan({
      TableName: TENANTS_TABLE,
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'ACTIVE'
      }
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        data: result.Items
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

module.exports.handler = mockAuth(listSedes);
