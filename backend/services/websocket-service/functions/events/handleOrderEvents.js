/**
 * Lambda: EventBridge -> WebSocket broadcaster
 * Broadcast order events to connected clients
 */

const { query } = require('../../shared/database/dynamodb-client');
const { broadcastToConnections } = require('../../shared/utils/websocket-client');

const WS_CONNECTIONS_TABLE = process.env.WS_CONNECTIONS_TABLE;
const WS_API_ENDPOINT = process.env.WS_API_ENDPOINT;

module.exports.handler = async (event) => {
  try {
    const detail = event.detail;
    const eventType = event['detail-type'];
    
    // Obtener todas las conexiones relevantes
    const connections = await query(
      WS_CONNECTIONS_TABLE,
      'tenant_id = :tenant_id',
      { ':tenant_id': detail.tenant_id || 'all' },
      'tenant-index'
    );
    
    const connectionIds = connections.map(c => c.connectionId);
    
    const message = {
      type: eventType,
      data: detail
    };
    
    const results = await broadcastToConnections(WS_API_ENDPOINT, connectionIds, message);
    
    console.log(`✅ Broadcast: ${results.successful.length} sent, ${results.stale.length} stale`);
    
    // Eliminar conexiones stale
    for (const staleId of results.stale) {
      await deleteItem(WS_CONNECTIONS_TABLE, { connectionId: staleId });
    }
    
    return { statusCode: 200, body: 'OK' };
  } catch (error) {
    console.error('❌ Error:', error);
    return { statusCode: 500, body: 'Error' };
  }
};
