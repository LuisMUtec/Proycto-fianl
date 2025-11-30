/**
 * Lambda: EventBridge Handler
 * Triggered by: OrderStatusChanged events
 * 
 * Envía notificaciones WebSocket a:
 * - Cliente que hizo la orden
 * - Staff del tenant (cocineros, repartidores, admin)
 */

const AWS = require('aws-sdk');

const dynamoConfig = process.env.STAGE === 'local' 
  ? {
      region: 'us-east-1',
      endpoint: 'http://localhost:8000',
      accessKeyId: 'dummy',
      secretAccessKey: 'dummy'
    }
  : {};

const dynamodb = new AWS.DynamoDB.DocumentClient(dynamoConfig);

// ApiGatewayManagementApi requiere endpoint específico
const WEBSOCKET_ENDPOINT = process.env.WEBSOCKET_ENDPOINT;
let apiGateway;

if (WEBSOCKET_ENDPOINT) {
  apiGateway = new AWS.ApiGatewayManagementApi({
    endpoint: WEBSOCKET_ENDPOINT
  });
}

const CONNECTIONS_TABLE = process.env.WS_CONNECTIONS_TABLE || 'WSConnections-dev';

async function handleOrderStatusChange(event) {
  try {
    console.log('📡 EventBridge event received:', JSON.stringify(event, null, 2));

    // Evento viene de EventBridge
    const detail = event.detail;
    const { 
      orderId, 
      previousStatus,
      newStatus, 
      tenant_id, 
      userId, 
      customerInfo,
      updatedBy,
      driverInfo,
      location,
      timestamp 
    } = detail;

    console.log(`🔔 Order ${orderId}: ${previousStatus} → ${newStatus}`);

    if (!apiGateway) {
      console.error('⚠️ WebSocket endpoint no configurado');
      return {
        statusCode: 200,
        body: 'WebSocket endpoint not configured'
      };
    }

    // Obtener todas las conexiones activas
    const connections = await dynamodb.scan({
      TableName: CONNECTIONS_TABLE
    }).promise();

    console.log(`📱 ${connections.Items.length} conexiones activas`);

    // Preparar mensajes personalizados según destinatario
    const notificationPromises = connections.Items.map(async (connection) => {
      try {
        const { connectionId, userId: connUserId, tenant_id: connTenantId, role } = connection;

        // Determinar si debe recibir notificación
        let shouldNotify = false;
        let message;

        // 1. Cliente que hizo la orden
        if (connUserId === userId) {
          shouldNotify = true;
          message = {
            type: 'ORDER_STATUS_UPDATE',
            data: {
              orderId,
              previousStatus,
              newStatus,
              timestamp,
              message: getCustomerMessage(newStatus),
              driverLocation: location || null,
              updatedBy: updatedBy ? {
                role: updatedBy.role,
                email: updatedBy.email
              } : null
            }
          };
        }
        // 2. Staff del mismo tenant
        else if (connTenantId === tenant_id) {
          shouldNotify = true;
          message = {
            type: 'ORDER_STATUS_UPDATE',
            data: {
              orderId,
              previousStatus,
              newStatus,
              tenant_id,
              customerInfo,
              updatedBy: updatedBy || null,
              timestamp,
              message: getStaffMessage(newStatus, role),
              handledBy: getHandlerInfo(newStatus, updatedBy, driverInfo)
            }
          };
        }

        if (shouldNotify && message) {
          console.log(`📤 Enviando a ${connectionId} (${role})`);
          await apiGateway.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify(message)
          }).promise();
        }

      } catch (error) {
        // Si la conexión está muerta (410 Gone), eliminarla
        if (error.statusCode === 410) {
          console.log(`🗑️ Eliminando conexión muerta: ${connection.connectionId}`);
          await dynamodb.delete({
            TableName: CONNECTIONS_TABLE,
            Key: { connectionId: connection.connectionId }
          }).promise();
        } else {
          console.error(`❌ Error al enviar a ${connection.connectionId}:`, error);
        }
      }
    });

    await Promise.all(notificationPromises);

    console.log(`✅ Notificaciones enviadas para orden ${orderId}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Notifications sent' })
    };

  } catch (error) {
    console.error('❌ Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send notifications' })
    };
  }
}

/**
 * Mensajes para clientes
 */
function getCustomerMessage(status) {
  const messages = {
    'CREATED': '¡Orden recibida! Estamos preparando tu pedido.',
    'COOKING': '🍳 Tu pedido está siendo preparado por nuestro chef.',
    'READY': '✅ ¡Tu pedido está listo! El repartidor lo recogerá pronto.',
    'DELIVERING': '🚚 ¡Tu pedido está en camino! El repartidor llegará pronto.',
    'DELIVERED': '🎉 ¡Pedido entregado! Disfruta tu comida.',
    'CANCELLED': '❌ Tu orden ha sido cancelada.'
  };
  return messages[status] || 'Estado de orden actualizado';
}

/**
 * Mensajes para staff
 */
function getStaffMessage(status, role) {
  const messages = {
    'CREATED': '📦 Nueva orden recibida - Requiere asignación',
    'COOKING': '🍳 Orden en preparación',
    'READY': '✅ Orden lista - Asignar repartidor',
    'DELIVERING': '🚚 Orden en ruta de entrega',
    'DELIVERED': '✨ Orden completada',
    'CANCELLED': '❌ Orden cancelada'
  };
  return messages[status] || 'Estado de orden actualizado';
}

/**
 * Obtener información de quién está manejando cada estado
 */
function getHandlerInfo(status, updatedBy, driverInfo) {
  if (status === 'COOKING' && updatedBy) {
    return {
      stage: 'Cocina',
      handler: updatedBy.email || 'Cocinero',
      role: updatedBy.role
    };
  }
  if ((status === 'DELIVERING' || status === 'DELIVERED') && driverInfo) {
    return {
      stage: 'Entrega',
      handler: driverInfo.email || 'Repartidor',
      role: 'Repartidor'
    };
  }
  if (status === 'READY') {
    return {
      stage: 'Lista para entrega',
      handler: 'Empacador',
      role: 'Empacador'
    };
  }
  return null;
}

module.exports.handler = handleOrderStatusChange;
