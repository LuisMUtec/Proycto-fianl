/**
 * SNS Client
 * 
 * ⚠️ SEGURIDAD:
 * - NO incluye credenciales
 * - Usa IAM Role de Lambda
 * - Compatible con AWS Academy
 */

const AWS = require('aws-sdk');

// Cliente SNS usa IAM Role automáticamente
const sns = new AWS.SNS({
  region: process.env.REGION || process.env.AWS_REGION || 'us-east-1'
});

/**
 * Publicar mensaje a tópico SNS
 * 
 * @param {string} topicArn - ARN del tópico
 * @param {string} message - Mensaje a publicar
 * @param {string} subject - Asunto (opcional)
 * @returns {Promise<Object>} - Resultado de la publicación
 */
async function publishMessage(topicArn, message, subject = null) {
  try {
    const params = {
      TopicArn: topicArn,
      Message: typeof message === 'string' ? message : JSON.stringify(message)
    };

    if (subject) {
      params.Subject = subject;
    }

    const result = await sns.publish(params).promise();
    console.log(`✅ Message published to SNS: ${result.MessageId}`);
    return result;
  } catch (error) {
    console.error('❌ SNS publishMessage error:', error.message);
    throw error;
  }
}

/**
 * Enviar notificación push (para móvil)
 */
async function sendPushNotification(endpointArn, message, data = {}) {
  try {
    const payload = {
      default: message,
      GCM: JSON.stringify({
        notification: {
          title: 'Fridays Perú',
          body: message
        },
        data: data
      }),
      APNS: JSON.stringify({
        aps: {
          alert: message,
          sound: 'default'
        },
        data: data
      })
    };

    const params = {
      TargetArn: endpointArn,
      Message: JSON.stringify(payload),
      MessageStructure: 'json'
    };

    const result = await sns.publish(params).promise();
    console.log(`✅ Push notification sent: ${result.MessageId}`);
    return result;
  } catch (error) {
    console.error('❌ SNS sendPushNotification error:', error.message);
    throw error;
  }
}

module.exports = {
  publishMessage,
  sendPushNotification
};
