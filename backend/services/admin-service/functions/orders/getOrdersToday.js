const AWS = require('aws-sdk');
const { mockAuth } = require('../../../../shared/middlewares/mock-auth');
const { USER_ROLES } = require('../../../../shared/constants/user-roles');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const ORDERS_TABLE = process.env.ORDERS_TABLE;

async function getOrdersToday(event) {
  try {
    const user = event.requestContext.authorizer;

    // Solo ADMIN_SEDE puede ver todas las órdenes
    if (user.role !== USER_ROLES.ADMIN_SEDE) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'No tienes permisos' })
      };
    }

    const today = new Date().toISOString().split('T')[0];
    
    const result = await dynamodb.query({
      TableName: ORDERS_TABLE,
      IndexName: 'tenantId-createdAt-index',
      KeyConditionExpression: 'tenantId = :tenantId AND begins_with(createdAt, :today)',
      ExpressionAttributeValues: {
        ':tenantId': user.tenantId,
        ':today': today
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

module.exports.handler = mockAuth(getOrdersToday);
