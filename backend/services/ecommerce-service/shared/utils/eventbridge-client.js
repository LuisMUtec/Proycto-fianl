/**
 * EventBridge Client
 * 
 * ⚠️ SEGURIDAD:
 * - NO incluye credenciales
 * - Usa IAM Role de Lambda
 * - Compatible con AWS Academy
 */

const AWS = require('aws-sdk');

// Cliente EventBridge usa IAM Role automáticamente
const eventbridge = new AWS.EventBridge({
  region: process.env.REGION || process.env.AWS_REGION || 'us-east-1'
});

const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME || 'fridays-event-bus';

/**
 * Publicar evento a EventBridge
 * 
 * @param {string} detailType - Tipo de evento (ej: 'OrderCreated')
 * @param {Object} detail - Datos del evento
 * @param {string} source - Fuente del evento (ej: 'fridays.ecommerce')
 * @returns {Promise<Object>} - Resultado del put
 */
async function publishEvent(detailType, detail, source = 'fridays.orders') {
  try {
    const params = {
      Entries: [
        {
          Source: source,
          DetailType: detailType,
          Detail: JSON.stringify(detail),
          EventBusName: EVENT_BUS_NAME
        }
      ]
    };

    const result = await eventbridge.putEvents(params).promise();
    
    if (result.FailedEntryCount > 0) {
      console.error('❌ Failed to publish event:', result.Entries);
      throw new Error('Event publish failed');
    }

    console.log(`✅ Event published: ${detailType}`, { source, eventBusName: EVENT_BUS_NAME });
    return result;
  } catch (error) {
    console.error(`❌ EventBridge publishEvent error:`, error.message);
    throw error;
  }
}

/**
 * Publicar múltiples eventos en batch
 */
async function publishEvents(events) {
  try {
    const entries = events.map(event => ({
      Source: event.source || 'fridays.orders',
      DetailType: event.detailType,
      Detail: JSON.stringify(event.detail),
      EventBusName: EVENT_BUS_NAME
    }));

    const params = {
      Entries: entries
    };

    const result = await eventbridge.putEvents(params).promise();
    
    if (result.FailedEntryCount > 0) {
      console.error('❌ Some events failed:', result.Entries);
    }

    console.log(`✅ ${events.length} events published`);
    return result;
  } catch (error) {
    console.error('❌ EventBridge publishEvents error:', error.message);
    throw error;
  }
}

module.exports = {
  publishEvent,
  publishEvents
};
