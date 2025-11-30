/**
 * Lambda: PUT /delivery/orders/{orderId}/status
 * Roles: Repartidor
 * 
 * Actualiza el estado de una orden (READY → DELIVERING → DELIVERED)
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

module.exports.handler = async (event) => {
  try {
    const { orderId } = event.pathParameters;
    const { status, location, notes } = JSON.parse(event.body);
    const user = event.requestContext.authorizer;

    console.log(`🚚 Actualizando orden ${orderId} → ${status} por repartidor ${user.userId}`);

    // Validar que el usuario sea repartidor
    if (user.role !== 'Repartidor') {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          success: false, 
          error: 'Solo repartidores pueden actualizar el estado de entrega' 
        })
      };
    }

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

    // Validar estados permitidos para delivery (READY → DELIVERING → DELIVERED)
    const validTransitions = {
      'READY': ['DELIVERING'],
      'DELIVERING': ['DELIVERED']
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

    // Construir UpdateExpression dinámicamente con información de quién realiza el cambio
    let updateExpression = 'SET #status = :status, updatedAt = :updatedAt, updatedBy = :userId, updatedByInfo = :updatedByInfo';
    const expressionAttributeNames = { '#status': 'status' };
    const expressionAttributeValues = {
      ':status': status,
      ':updatedAt': now,
      ':userId': user.userId,
      ':updatedByInfo': {
        userId: user.userId,
        email: user.email,
        role: user.role,
        timestamp: now
      }
    };

    // Agregar assignedDriver cuando el repartidor toma la orden (DELIVERING)
    if (status === 'DELIVERING') {
      updateExpression += ', assignedDriver = :assignedDriver';
      expressionAttributeValues[':assignedDriver'] = {
        userId: user.userId,
        email: user.email,
        role: user.role,
        name: user.email.split('@')[0], // Extraer nombre del email
        assignedAt: now
      };
    }

    // Agregar deliveredAt si el estado es DELIVERED
    if (status === 'DELIVERED') {
      updateExpression += ', deliveredAt = :deliveredAt';
      expressionAttributeValues[':deliveredAt'] = now;
    }

    // Agregar ubicación del repartidor si existe
    if (location) {
      updateExpression += ', driverLocation = :location';
      expressionAttributeValues[':location'] = location;
    }

    // Agregar notas si existen
    if (notes) {
      updateExpression += ', deliveryNotes = :notes';
      expressionAttributeValues[':notes'] = notes;
    }

    // Actualizar orden
    const updated = await dynamodb.update({
      TableName: ORDERS_TABLE,
      Key: { orderId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    }).promise();

    console.log(`✅ Orden ${orderId} actualizada a ${status}`);

    // Emitir evento a EventBridge para WebSocket
    try {
      await eventBridge.putEvents({
        Entries: [{
          Source: 'fridays.delivery',
          DetailType: 'OrderStatusChanged',
          Detail: JSON.stringify({
            orderId,
            previousStatus: currentOrder.Item.status,
            newStatus: status,
            tenant_id: updated.Attributes.tenant_id,
            userId: updated.Attributes.userId,
            customerInfo: updated.Attributes.customerInfo,
            driverInfo: {
              userId: user.userId,
              email: user.email
            },
            location: location || null,
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
        error: 'Error al actualizar estado de entrega' 
      })
    };
  }
};
