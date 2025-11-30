/**
 * Step Functions Lambda: PublishOrderCreatedEvent
 * Publish to EventBridge and SNS
 */

const { publishEvent } = require('../../shared/utils/eventbridge-client');
const { publishMessage } = require('../../shared/utils/sns-client');

const SNS_NOTIFICATIONS_TOPIC_ARN = process.env.SNS_NOTIFICATIONS_TOPIC_ARN;

module.exports.handler = async (event) => {
  try {
    // Publicar a EventBridge
    await publishEvent('OrderCreated', {
      orderId: event.orderId,
      userId: event.userId,
      tenant_id: event.tenant_id,
      total: event.total
    }, 'fridays.orders');
    
    // Publicar a SNS para notificaciones
    await publishMessage(
      SNS_NOTIFICATIONS_TOPIC_ARN,
      `Nueva orden ${event.orderId} creada`,
      'Fridays Perú - Nueva Orden'
    );
    
    return event;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
};
