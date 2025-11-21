const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const apiGateway = new AWS.ApiGatewayManagementApi({
  endpoint: process.env.WEBSOCKET_ENDPOINT
});

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE;

async function handleOrderStatusChange(event) {
  try {
    // Evento viene de EventBridge
    const detail = event.detail;
    const { orderId, status, tenantId, userId, driverId } = detail;

    console.log('Order status changed:', detail);

    // Obtener todas las conexiones activas
    const connections = await dynamodb.scan({
      TableName: CONNECTIONS_TABLE
    }).promise();

    // Preparar mensaje
    const message = {
      type: 'ORDER_STATUS_CHANGED',
      data: {
        orderId,
        status,
        timestamp: new Date().toISOString()
      }
    };

    // Enviar a todas las conexiones activas
    const sendPromises = connections.Items.map(async ({ connectionId }) => {
      try {
        await apiGateway.postToConnection({
          ConnectionId: connectionId,
          Data: JSON.stringify(message)
        }).promise();
      } catch (error) {
        // Si la conexión está muerta, eliminarla
        if (error.statusCode === 410) {
          await dynamodb.delete({
            TableName: CONNECTIONS_TABLE,
            Key: { connectionId }
          }).promise();
        }
      }
    });

    await Promise.all(sendPromises);

    return {
      statusCode: 200,
      body: 'Notifications sent'
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: 'Failed to send notifications'
    };
  }
}

module.exports.handler = handleOrderStatusChange;
