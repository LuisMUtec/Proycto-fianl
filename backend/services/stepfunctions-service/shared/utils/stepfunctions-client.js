/**
 * Step Functions Client
 * 
 * ⚠️ SEGURIDAD:
 * - NO incluye credenciales
 * - Usa IAM Role de Lambda
 * - Compatible con AWS Academy
 */

const AWS = require('aws-sdk');

// Cliente Step Functions usa IAM Role automáticamente
const stepFunctions = new AWS.StepFunctions({
  region: process.env.REGION || process.env.AWS_REGION || 'us-east-1'
});

/**
 * Iniciar ejecución de Step Function
 * 
 * @param {string} stateMachineArn - ARN de la state machine
 * @param {Object} input - Input para la ejecución
 * @param {string} name - Nombre de la ejecución (opcional)
 * @returns {Promise<Object>} - Resultado de la ejecución
 */
async function startExecution(stateMachineArn, input, name = null) {
  try {
    const params = {
      stateMachineArn: stateMachineArn,
      input: JSON.stringify(input)
    };

    if (name) {
      params.name = name;
    }

    const result = await stepFunctions.startExecution(params).promise();
    console.log(`✅ Step Function execution started: ${result.executionArn}`);
    return result;
  } catch (error) {
    console.error('❌ Step Functions startExecution error:', error.message);
    throw error;
  }
}

/**
 * Obtener estado de ejecución
 */
async function describeExecution(executionArn) {
  try {
    const params = {
      executionArn: executionArn
    };

    const result = await stepFunctions.describeExecution(params).promise();
    return result;
  } catch (error) {
    console.error('❌ Step Functions describeExecution error:', error.message);
    throw error;
  }
}

/**
 * Detener ejecución
 */
async function stopExecution(executionArn, error = null, cause = null) {
  try {
    const params = {
      executionArn: executionArn
    };

    if (error) {
      params.error = error;
    }

    if (cause) {
      params.cause = cause;
    }

    const result = await stepFunctions.stopExecution(params).promise();
    console.log(`✅ Step Function execution stopped: ${executionArn}`);
    return result;
  } catch (error) {
    console.error('❌ Step Functions stopExecution error:', error.message);
    throw error;
  }
}

module.exports = {
  startExecution,
  describeExecution,
  stopExecution
};
