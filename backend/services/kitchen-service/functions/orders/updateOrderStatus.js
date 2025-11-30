/**
 * Lambda: PUT /orders/{orderId}/status
 * Roles: Cheff Ejecutivo, Cocinero, Empacador
 * 
 * Actualiza el estado de una orden (CREATED → COOKING → READY)
 * Emite evento a EventBridge para notificaciones WebSocket
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
const eventBridge = new AWS.EventBridge();

const ORDERS_TABLE = process.env.ORDERS_TABLE || 'Orders-dev';
const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME || 'fridays-event-bus-dev';

async function updateOrderStatus(event) {
  try {
    const { orderId } = event.pathParameters;
    const { status, notes } = JSON.parse(event.body);
    const user = event.requestContext.authorizer;

    console.log(`🍳 Actualizando orden ${orderId} → ${status} por ${user.role}`);

    // Obtener orden actual
    const currentOrder = await dynamodb.get({
      TableName: ORDERS_TABLE,
      Key: { orderId }
    }).promise();

    if (!currentOrder.Item) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          success: false, 
          error: 'Orden no encontrada' 
        })
      };
    }

    // Validar que el usuario pertenezca al mismo tenant
    if (currentOrder.Item.tenant_id !== user.tenant_id) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          success: false, 
          error: 'No tienes acceso a esta orden' 
        })
      };
    }

    // Validar estados permitidos para cocina (CREATED → COOKING → READY)
    const validTransitions = {
      'CREATED': ['COOKING'],
      'COOKING': ['READY'],
      'READY': [] // Ya no puede cambiar desde cocina
    };

    const allowedStatuses = validTransitions[currentOrder.Item.status] || [];
    
    if (!allowedStatuses.includes(status)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          success: false, 
          error: `No se puede cambiar de ${currentOrder.Item.status} a ${status}`,
          allowedStatuses
        })
      };
    }

    const now = new Date().toISOString();

    // Actualizar orden con información de quién realiza el cambio
    const updateParams = {
      TableName: ORDERS_TABLE,
      Key: { orderId },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt, updatedBy = :userId, updatedByInfo = :updatedByInfo',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':updatedAt': now,
        ':userId': user.userId,
        ':updatedByInfo': {
          userId: user.userId,
          email: user.email,
          role: user.role,
          timestamp: now
        }
      },
      ReturnValues: 'ALL_NEW'
    };

    // Agregar assignedTo cuando el cocinero toma la orden
    if (status === 'COOKING') {
      updateParams.UpdateExpression += ', assignedTo = :assignedTo';
      updateParams.ExpressionAttributeValues[':assignedTo'] = {
        userId: user.userId,
        email: user.email,
        role: user.role,
        name: user.email.split('@')[0], // Extraer nombre del email
        assignedAt: now
      };
    }

    // Agregar notas si existen
    if (notes) {
      updateParams.UpdateExpression += ', kitchenNotes = :notes';
      updateParams.ExpressionAttributeValues[':notes'] = notes;
    }

    const updated = await dynamodb.update(updateParams).promise();

    console.log(`✅ Orden ${orderId} actualizada a ${status}`);

    // Emitir evento a EventBridge para WebSocket
    try {
      await eventBridge.putEvents({
        Entries: [{
          Source: 'fridays.kitchen',
          DetailType: 'OrderStatusChanged',
          Detail: JSON.stringify({
            orderId,
            previousStatus: currentOrder.Item.status,
            newStatus: status,
            tenant_id: updated.Attributes.tenant_id,
            userId: updated.Attributes.userId,
            customerInfo: updated.Attributes.customerInfo,
            updatedBy: {
              userId: user.userId,
              email: user.email,
              role: user.role
            },
            timestamp: now
          }),
          EventBusName: EVENT_BUS_NAME
        }]
      }).promise();

      console.log(`📡 Evento emitido a EventBridge`);
    } catch (eventError) {
      console.error('⚠️ Error al emitir evento:', eventError);
      // No fallar la actualización si falla el evento
    }

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: true, 
        message: `Orden actualizada a ${status}`,
        data: updated.Attributes 
      })
    };

  } catch (error) {
    console.error('❌ Error:', error);
    return {
      statusCode: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: false, 
        error: 'Error al actualizar orden' 
      })
    };
  }
}

module.exports.handler = updateOrderStatus;
