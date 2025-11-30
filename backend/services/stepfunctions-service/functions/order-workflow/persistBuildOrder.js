/**
 * Step Functions Lambda: Persist&BuildOrder
 * Save order to DDB and send to SQS
 */

const { putItem } = require('../../shared/database/dynamodb-client');
const { sendMessage } = require('../../shared/utils/sqs-client');

const ORDERS_TABLE = process.env.ORDERS_TABLE;
const SQS_ORDER_QUEUE_URL = process.env.SQS_ORDER_QUEUE_URL;

module.exports.handler = async (event) => {
  try {
    const order = {
      orderId: event.orderId,
      userId: event.userId,
      tenant_id: event.tenant_id,
      items: event.validatedItems,
      total: event.total,
      deliveryAddress: event.deliveryAddress,
      status: 'CREATED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await putItem(ORDERS_TABLE, order);
    
    // Enviar a SQS para procesamiento asíncrono
    await sendMessage(SQS_ORDER_QUEUE_URL, order);
    
    return order;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
};
