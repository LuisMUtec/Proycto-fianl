/**
 * SQS Worker: Process order queue
 */

const { updateItem } = require('../../shared/database/dynamodb-client');

const ORDERS_TABLE = process.env.ORDERS_TABLE;

module.exports.handler = async (event) => {
  try {
    for (const record of event.Records) {
      const order = JSON.parse(record.body);
      
      console.log(`Processing order: ${order.orderId}`);
      
      // Aquí puedes agregar lógica adicional de procesamiento
      // Por ejemplo: enviar email, notificaciones, etc.
      
      await updateItem(
        ORDERS_TABLE,
        { orderId: order.orderId },
        'SET processed = :processed, updatedAt = :updatedAt',
        {
          ':processed': true,
          ':updatedAt': new Date().toISOString()
        }
      );
      
      console.log(`✅ Order ${order.orderId} processed`);
    }
    
    return { statusCode: 200, body: 'OK' };
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
};
