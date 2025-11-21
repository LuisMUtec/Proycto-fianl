const AWS = require('aws-sdk');
const { mockAuth } = require('../../../../shared/middlewares/mock-auth');
const { USER_ROLES } = require('../../../../shared/constants/user-roles');
const { ORDER_STATUS } = require('../../../../shared/constants/order-status');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const eventBridge = new AWS.EventBridge();

const ORDERS_TABLE = process.env.ORDERS_TABLE;

async function updateOrderStatus(event) {
  try {
    const { orderId } = event.pathParameters;
    const { status } = JSON.parse(event.body);
    const user = event.requestContext.authorizer;

    // Solo personal de cocina puede actualizar
    if (![USER_ROLES.CHEF_EJECUTIVO, USER_ROLES.COCINERO, USER_ROLES.EMPACADOR, USER_ROLES.ADMIN_SEDE].includes(user.role)) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'No tienes permisos' })
      };
    }

    // Validar estados permitidos
    if (!['COOKING', 'READY'].includes(status)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'Estado inválido para cocina' })
      };
    }

    const updated = await dynamodb.update({
      TableName: ORDERS_TABLE,
      Key: { orderId },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt, updatedBy = :userId',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':updatedAt': new Date().toISOString(),
        ':userId': user.userId
      },
      ReturnValues: 'ALL_NEW'
    }).promise();

    // Emitir evento
    await eventBridge.putEvents({
      Entries: [{
        Source: 'fridays.kitchen',
        DetailType: 'OrderStatusChanged',
        Detail: JSON.stringify({
          orderId,
          status,
          tenantId: updated.Attributes.tenantId,
          userId: updated.Attributes.userId
        })
      }]
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

module.exports.handler = mockAuth(updateOrderStatus);
