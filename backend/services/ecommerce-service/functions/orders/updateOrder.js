const { success, error, forbidden } = require('../../shared/utils/response');
const { getItem, putItem, query, scan, updateItem, deleteItem } = require('../../shared/database/dynamodb-client');
const { validateOwnership, validateTenantAccess } = require('../../shared/utils/validation');
const AWS = require('aws-sdk');
const sns = new AWS.SNS();
const SNS_TOPIC_ARN = process.env.SNS_NOTIFICATIONS_TOPIC_ARN;

/**
 * PUT /orders/{{orderId}} - Admin update order
 */
exports.handler = async (event) => {
  try {
    console.log('Event:', JSON.stringify(event, null, 2));
    const { orderId } = event.pathParameters;
    const { status, ...updateFields } = JSON.parse(event.body);
    if (!orderId || !status) {
      return error('orderId y status son requeridos');
    }

    // Obtener orden actual
    const ORDERS_TABLE = process.env.ORDERS_TABLE || 'Orders-dev';
    const orderResult = await getItem(ORDERS_TABLE, { orderId });
    if (!orderResult) {
      return error('Orden no encontrada');
    }

    // Obtener usuario que hace el cambio
    const user = event.requestContext?.authorizer || {};
    const updatedBy = {
      email: user.email || '',
      name: user.name || '',
      role: user.role || '',
      timestamp: new Date().toISOString()
    };

    // Actualizar estado y otros campos
    const updatedOrder = {
      ...orderResult,
      status,
      ...updateFields,
      updatedAt: new Date().toISOString(),
      updatedBy,
      // handler: responsable de la etapa actual
      handler: updateFields.handler || updatedBy,
      // historial de cambios
      history: [
        ...(orderResult.history || []),
        {
          status,
          updatedBy,
          handler: updateFields.handler || updatedBy,
          timestamp: new Date().toISOString()
        }
      ]
    };

    await putItem(ORDERS_TABLE, updatedOrder);

    // Publicar evento en EventBridge para notificación WebSocket
    const eventBridge = new AWS.EventBridge();
    try {
      await eventBridge.putEvents({
        Entries: [
          {
            Source: 'ecommerce-service.orders',
            DetailType: 'OrderStatusChanged',
            EventBusName: process.env.EVENT_BUS_NAME,
            Detail: JSON.stringify({
              orderId,
              previousStatus: orderResult.status,
              newStatus: status,
              tenant_id: updatedOrder.tenant_id || null,
              userId: updatedOrder.userId || null,
              customerInfo: updatedOrder.customerInfo || null,
              updatedBy,
              driverInfo: updatedOrder.driverInfo || null,
              location: updatedOrder.location || null,
              timestamp: updatedOrder.updatedAt
            })
          }
        ]
      }).promise();
      console.log('📡 Evento OrderStatusChanged publicado en EventBridge');
    } catch (ebError) {
      console.error('❌ Error al publicar evento en EventBridge:', ebError);
    }

    // Publicar en SNS
    if (SNS_TOPIC_ARN) {
      try {
        await sns.publish({
          TopicArn: SNS_TOPIC_ARN,
          Subject: `Estado de orden actualizado: ${orderId}`,
          Message: `La orden ${orderId} cambió a estado: ${status}\n\n${JSON.stringify(updatedOrder, null, 2)}`
        }).promise();
        console.log('📧 Notificación SNS enviada');
      } catch (snsError) {
        console.error('❌ Error al publicar en SNS:', snsError);
      }
    }

    // Si el estado es READY, iniciar Step Function de asignación automática de driver
    if (status === 'READY') {
      const stepfunctions = new AWS.StepFunctions();
      const input = {
        orderId,
        tenant_id: updatedOrder.tenant_id,
        sedeLocation: updatedOrder.sedeLocation // Asegúrate que este campo exista en la orden
      };
      try {
        const params = {
          stateMachineArn: process.env.ASSIGN_DRIVER_STEPFUNCTION_ARN,
          input: JSON.stringify(input)
        };
        await stepfunctions.startExecution(params).promise();
        console.log('🚚 Step Function de asignación de driver iniciada');
      } catch (sfError) {
        console.error('❌ Error al iniciar Step Function:', sfError);
      }
    }

    // Si el estado es PACKED, puedes agregar lógica adicional aquí (notificación, integración, etc.)
    if (status === 'PACKED') {
      // Ejemplo: notificar al delivery que la orden está lista para recoger
      // await sns.publish({ ... })
      console.log('📦 Orden empaquetada, lista para el delivery');
    }

    return success({ message: 'Orden actualizada', order: updatedOrder });
  } catch (err) {
    console.error('Error:', err);
    return error(err.message || 'Error interno del servidor');
  }
};
