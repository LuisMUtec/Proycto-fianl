/**
 * API Gateway Management Client (WebSocket)
 * 
 * ⚠️ SEGURIDAD:
 * - NO incluye credenciales
 * - Usa IAM Role de Lambda
 * - Compatible con AWS Academy
 */

const AWS = require('aws-sdk');

/**
 * Enviar mensaje a conexión WebSocket
 * 
 * @param {string} endpoint - WebSocket API endpoint
 * @param {string} connectionId - ID de la conexión
 * @param {Object} data - Datos a enviar
 */
async function sendToConnection(endpoint, connectionId, data) {
  try {
    const apiGateway = new AWS.ApiGatewayManagementApi({
      endpoint: endpoint
    });

    const params = {
      ConnectionId: connectionId,
      Data: JSON.stringify(data)
    };

    await apiGateway.postToConnection(params).promise();
    console.log(`✅ Message sent to WebSocket connection: ${connectionId}`);
  } catch (error) {
    if (error.statusCode === 410) {
      console.log(`🗑️ Connection ${connectionId} is stale, should be deleted`);
      throw new Error('CONNECTION_STALE');
    }
    console.error('❌ WebSocket sendToConnection error:', error.message);
    throw error;
  }
}

/**
 * Enviar mensaje a múltiples conexiones
 */
async function broadcastToConnections(endpoint, connectionIds, data) {
  const apiGateway = new AWS.ApiGatewayManagementApi({
    endpoint: endpoint
  });

  const results = {
    successful: [],
    failed: [],
    stale: []
  };

  for (const connectionId of connectionIds) {
    try {
      const params = {
        ConnectionId: connectionId,
        Data: JSON.stringify(data)
      };

      await apiGateway.postToConnection(params).promise();
      results.successful.push(connectionId);
    } catch (error) {
      if (error.statusCode === 410) {
        results.stale.push(connectionId);
      } else {
        results.failed.push(connectionId);
      }
    }
  }

  console.log(`✅ Broadcast completed: ${results.successful.length} sent, ${results.stale.length} stale, ${results.failed.length} failed`);
  return results;
}

module.exports = {
  sendToConnection,
  broadcastToConnections
};
