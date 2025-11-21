const AWS = require('aws-sdk');
const { mockAuth } = require('../../../../shared/middlewares/mock-auth');
const { USER_ROLES } = require('../../../../shared/constants/user-roles');
const { ORDER_STATUS } = require('../../../../shared/constants/order-status');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const eventBridge = new AWS.EventBridge();

const ORDERS_TABLE = process.env.ORDERS_TABLE;

async function updateStatus(event) {
  try {
    const { orderId } = event.pathParameters;
    const { status, location } = JSON.parse(event.body);
    const user = event.requestContext.authorizer;

    // Solo REPARTIDOR puede actualizar el estado
    if (user.role !== USER_ROLES.REPARTIDOR) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'No tienes permisos' })
      };
    }

    // Verificar que el estado es válido
    if (!['DELIVERING', 'DELIVERED'].includes(status)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'Estado inválido' })
      };
    }

    // Obtener orden
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

    // Verificar que el repartidor es el asignado
    if (orderResult.Item.driverId !== user.userId) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'No estás asignado a esta orden' })
      };
    }

    // Actualizar orden
    const updateExpression = status === 'DELIVERED'
      ? 'SET #status = :status, deliveredAt = :deliveredAt, updatedAt = :updatedAt'
      : 'SET #status = :status, driverLocation = :location, updatedAt = :updatedAt';

    const expressionValues = status === 'DELIVERED'
      ? {
          ':status': status,
          ':deliveredAt': new Date().toISOString(),
          ':updatedAt': new Date().toISOString()
        }
      : {
          ':status': status,
          ':location': location,
          ':updatedAt': new Date().toISOString()
        };

    const updatedOrder = await dynamodb.update({
      TableName: ORDERS_TABLE,
      Key: { orderId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: expressionValues,
      ReturnValues: 'ALL_NEW'
    }).promise();

    // Emitir evento para WebSocket
    await eventBridge.putEvents({
      Entries: [{
        Source: 'fridays.delivery',
        DetailType: 'OrderStatusChanged',
        Detail: JSON.stringify({
          orderId,
          status,
          driverId: user.userId,
          location,
          tenantId: orderResult.Item.tenantId,
          userId: orderResult.Item.userId
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

module.exports.handler = mockAuth(updateStatus);
