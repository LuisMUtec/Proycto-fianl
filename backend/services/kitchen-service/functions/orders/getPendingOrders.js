const AWS = require('aws-sdk');
const { mockAuth } = require('../../../../shared/middlewares/mock-auth');
const { USER_ROLES } = require('../../../../shared/constants/user-roles');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const ORDERS_TABLE = process.env.ORDERS_TABLE;

async function getPendingOrders(event) {
  try {
    const user = event.requestContext.authorizer;

    // Solo personal de cocina puede ver órdenes pendientes
    if (![USER_ROLES.CHEF_EJECUTIVO, USER_ROLES.COCINERO, USER_ROLES.EMPACADOR, USER_ROLES.ADMIN_SEDE].includes(user.role)) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'No tienes permisos' })
      };
    }

    const result = await dynamodb.query({
      TableName: ORDERS_TABLE,
      IndexName: 'tenantId-status-index',
      KeyConditionExpression: 'tenantId = :tenantId AND #status IN (:created, :cooking)',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':tenantId': user.tenantId,
        ':created': 'CREATED',
        ':cooking': 'COOKING'
      }
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, data: result.Items })
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

module.exports.handler = mockAuth(getPendingOrders);
