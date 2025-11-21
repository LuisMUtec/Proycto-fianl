const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE;

async function onConnect(event) {
  try {
    const connectionId = event.requestContext.connectionId;
    
    // En producción, aquí validarías el token JWT del query string
    // Por ahora, guardamos la conexión
    const connection = {
      connectionId,
      connectedAt: new Date().toISOString(),
      ttl: Math.floor(Date.now() / 1000) + (2 * 60 * 60) // 2 horas
    };

    await dynamodb.put({
      TableName: CONNECTIONS_TABLE,
      Item: connection
    }).promise();

    return {
      statusCode: 200,
      body: 'Connected'
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: 'Failed to connect'
    };
  }
}

module.exports.handler = onConnect;
