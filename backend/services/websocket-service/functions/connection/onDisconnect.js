/**
 * Lambda: WebSocket $disconnect
 * Remove connection from table
 */

const { deleteItem } = require('../../shared/database/dynamodb-client');

const WS_CONNECTIONS_TABLE = process.env.WS_CONNECTIONS_TABLE;

module.exports.handler = async (event) => {
  try {
    const connectionId = event.requestContext.connectionId;
    
    await deleteItem(WS_CONNECTIONS_TABLE, { connectionId });
    
    console.log(`✅ Connection removed: ${connectionId}`);
    
    return { statusCode: 200, body: 'Disconnected' };
  } catch (error) {
    console.error('❌ Error:', error);
    return { statusCode: 500, body: 'Error' };
  }
};
