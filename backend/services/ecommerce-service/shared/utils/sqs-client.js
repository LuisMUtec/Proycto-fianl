/**
 * SQS Client
 * 
 * ⚠️ SEGURIDAD:
 * - NO incluye credenciales
 * - Usa IAM Role de Lambda
 * - Compatible con AWS Academy
 */

const AWS = require('aws-sdk');

// Cliente SQS usa IAM Role automáticamente
const sqs = new AWS.SQS({
  region: process.env.REGION || process.env.AWS_REGION || 'us-east-1'
});

/**
 * Enviar mensaje a cola SQS (soporta Standard y FIFO)
 * 
 * @param {string} queueUrl - URL de la cola
 * @param {Object} message - Mensaje a enviar
 * @param {Object} attributes - Atributos del mensaje (opcional)
 * @param {string} messageGroupId - MessageGroupId para colas FIFO (opcional)
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendMessage(queueUrl, message, attributes = {}, messageGroupId = null) {
  try {
    const params = {
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(message),
      MessageAttributes: attributes
    };

    // Detectar si es cola FIFO (termina en .fifo)
    const isFifo = queueUrl.endsWith('.fifo');
    
    if (isFifo) {
      // Para colas FIFO, MessageGroupId es requerido
      params.MessageGroupId = messageGroupId || message.orderId || message.id || 'default-group';
      
      // ContentBasedDeduplication está habilitado en la cola, 
      // pero podemos proporcionar MessageDeduplicationId si queremos control manual
      // params.MessageDeduplicationId = message.orderId || Date.now().toString();
      
      console.log(`📦 Sending FIFO message with GroupId: ${params.MessageGroupId}`);
    }

    const result = await sqs.sendMessage(params).promise();
    console.log(`✅ Message sent to SQS: ${result.MessageId}`);
    return result;
  } catch (error) {
    console.error('❌ SQS sendMessage error:', error.message);
    throw error;
  }
}

/**
 * Enviar múltiples mensajes en batch (soporta Standard y FIFO)
 */
async function sendMessageBatch(queueUrl, messages) {
  try {
    const isFifo = queueUrl.endsWith('.fifo');
    
    const entries = messages.map((msg, index) => {
      const entry = {
        Id: `msg-${index}`,
        MessageBody: JSON.stringify(msg)
      };
      
      // Para colas FIFO, agregar MessageGroupId
      if (isFifo) {
        entry.MessageGroupId = msg.orderId || msg.id || `group-${index}`;
      }
      
      return entry;
    });

    const params = {
      QueueUrl: queueUrl,
      Entries: entries
    };

    const result = await sqs.sendMessageBatch(params).promise();
    
    if (result.Failed && result.Failed.length > 0) {
      console.error('❌ Some messages failed:', result.Failed);
    }

    console.log(`✅ ${result.Successful.length} messages sent to SQS`);
    return result;
  } catch (error) {
    console.error('❌ SQS sendMessageBatch error:', error.message);
    throw error;
  }
}

/**
 * Recibir mensajes de la cola
 */
async function receiveMessages(queueUrl, maxMessages = 10, waitTimeSeconds = 0) {
  try {
    const params = {
      QueueUrl: queueUrl,
      MaxNumberOfMessages: maxMessages,
      WaitTimeSeconds: waitTimeSeconds
    };

    const result = await sqs.receiveMessage(params).promise();
    return result.Messages || [];
  } catch (error) {
    console.error('❌ SQS receiveMessages error:', error.message);
    throw error;
  }
}

/**
 * Eliminar mensaje de la cola
 */
async function deleteMessage(queueUrl, receiptHandle) {
  try {
    const params = {
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle
    };

    await sqs.deleteMessage(params).promise();
    console.log('✅ Message deleted from SQS');
  } catch (error) {
    console.error('❌ SQS deleteMessage error:', error.message);
    throw error;
  }
}

module.exports = {
  sendMessage,
  sendMessageBatch,
  receiveMessages,
  deleteMessage
};
