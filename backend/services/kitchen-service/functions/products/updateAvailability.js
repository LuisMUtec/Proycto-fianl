const AWS = require('aws-sdk');
const { mockAuth } = require('../../../../shared/middlewares/mock-auth');
const { USER_ROLES } = require('../../../../shared/constants/user-roles');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;

async function updateAvailability(event) {
  try {
    const { productId } = event.pathParameters;
    const { isAvailable } = JSON.parse(event.body);
    const user = event.requestContext.authorizer;

    // Solo chef ejecutivo o admin pueden cambiar disponibilidad
    if (![USER_ROLES.CHEF_EJECUTIVO, USER_ROLES.ADMIN_SEDE].includes(user.role)) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'No tienes permisos' })
      };
    }

    const updated = await dynamodb.update({
      TableName: PRODUCTS_TABLE,
      Key: { productId },
      UpdateExpression: 'SET isAvailable = :available, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':available': isAvailable,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, data: updated.Attributes })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, error: 'Error interno' })
    };
  }
}

module.exports.handler = mockAuth(updateAvailability);
