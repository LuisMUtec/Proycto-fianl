/**
 * Lambda: WebSocket $connect
 * Store connectionId with user info
 */

const { verifyToken } = require('../../shared/auth/jwt-utils');
const { putItem } = require('../../shared/database/dynamodb-client');

const WS_CONNECTIONS_TABLE = process.env.WS_CONNECTIONS_TABLE;

module.exports.handler = async (event) => {
  try {
    const connectionId = event.requestContext.connectionId;
    const token = event.queryStringParameters?.token;
    
    if (!token) {
      return { statusCode: 401, body: 'Unauthorized' };
    }
    
    const decoded = await verifyToken(token);
    
    await putItem(WS_CONNECTIONS_TABLE, {
      connectionId,
      userId: decoded.userId,
      tenant_id: decoded.tenant_id || null,
      connectedAt: new Date().toISOString()
    });
    
    console.log(`✅ Connection stored: ${connectionId}`);
    
    return { statusCode: 200, body: 'Connected' };
  } catch (error) {
    console.error('❌ Error:', error);
    return { statusCode: 500, body: 'Error' };
  }
};
