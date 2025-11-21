const AWS = require('aws-sdk');
const { mockAuth } = require('../../../../shared/middlewares/mock-auth');
const { USER_ROLES } = require('../../../../shared/constants/user-roles');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const eventBridge = new AWS.EventBridge();

const ORDERS_TABLE = process.env.ORDERS_TABLE;
const USERS_TABLE = process.env.USERS_TABLE;

async function assignDriver(event) {
  try {
    const { orderId } = event.pathParameters;
    const { driverId } = JSON.parse(event.body);
    const user = event.requestContext.authorizer;

    // Solo ADMIN_SEDE o REPARTIDOR pueden asignar
    if (![USER_ROLES.ADMIN_SEDE, USER_ROLES.REPARTIDOR].includes(user.role)) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'No tienes permisos' })
      };
    }

    // Verificar que la orden existe y está en estado READY
    const orderResult = await dynamodb.get({
      TableName: ORDERS_TABLE,
      Key: { orderId }
    }).promise();

    if (!orderResult.Item) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'Orden no encontrada' })
      };
    }

    if (orderResult.Item.status !== 'READY') {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'La orden debe estar en estado READY' })
      };
    }

    // Verificar que el driver existe
    const driverResult = await dynamodb.get({
      TableName: USERS_TABLE,
      Key: { userId: driverId }
    }).promise();

    if (!driverResult.Item || driverResult.Item.role !== USER_ROLES.REPARTIDOR) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'Repartidor no encontrado' })
      };
    }

    // Actualizar orden
    const updatedOrder = await dynamodb.update({
      TableName: ORDERS_TABLE,
      Key: { orderId },
      UpdateExpression: 'SET #status = :status, driverId = :driverId, assignedAt = :assignedAt, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'DELIVERING',
        ':driverId': driverId,
        ':assignedAt': new Date().toISOString(),
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    }).promise();

    // Emitir evento para WebSocket
    await eventBridge.putEvents({
      Entries: [{
        Source: 'fridays.delivery',
        DetailType: 'OrderStatusChanged',
        Detail: JSON.stringify({
          orderId,
          status: 'DELIVERING',
          driverId,
          tenantId: orderResult.Item.tenantId
        })
      }]
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        data: updatedOrder.Attributes
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

module.exports.handler = mockAuth(assignDriver);
