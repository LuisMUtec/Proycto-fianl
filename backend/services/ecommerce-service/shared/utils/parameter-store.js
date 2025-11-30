/**
 * AWS Systems Manager Parameter Store Client
 * 
 * ⚠️ SEGURIDAD:
 * - NO incluye credenciales
 * - Usa IAM Role de Lambda
 * - Compatible con AWS Academy
 */

const AWS = require('aws-sdk');

// Cliente SSM usa IAM Role automáticamente
const ssm = new AWS.SSM({
  region: process.env.REGION || process.env.AWS_REGION || 'us-east-1'
});

/**
 * Obtener parámetro de Parameter Store
 * 
 * @param {string} name - Nombre del parámetro (ej: /fridays/jwt-secret)
 * @param {boolean} decrypt - Si debe descifrar parámetros SecureString
 * @returns {Promise<string>} - Valor del parámetro
 */
async function getParameter(name, decrypt = true) {
  try {
    const params = {
      Name: name,
      WithDecryption: decrypt
    };

    const result = await ssm.getParameter(params).promise();
    return result.Parameter.Value;
  } catch (error) {
    console.error(`❌ Error obteniendo parámetro ${name}:`, error.message);
    throw error;
  }
}

/**
 * Obtener múltiples parámetros por path
 * 
 * @param {string} path - Path base (ej: /fridays/)
 * @param {boolean} decrypt - Si debe descifrar
 * @returns {Promise<Object>} - Objeto con parámetros
 */
async function getParametersByPath(path, decrypt = true) {
  try {
    const params = {
      Path: path,
      Recursive: true,
      WithDecryption: decrypt
    };

    const result = await ssm.getParametersByPath(params).promise();
    
    // Convertir a objeto clave-valor
    const parameters = {};
    result.Parameters.forEach(param => {
      const key = param.Name.split('/').pop();
      parameters[key] = param.Value;
    });

    return parameters;
  } catch (error) {
    console.error(`❌ Error obteniendo parámetros de ${path}:`, error.message);
    throw error;
  }
}

/**
 * Guardar parámetro (útil para scripts de setup)
 */
async function putParameter(name, value, type = 'SecureString', description = '') {
  try {
    const params = {
      Name: name,
      Value: value,
      Type: type,
      Description: description,
      Overwrite: true
    };

    await ssm.putParameter(params).promise();
    console.log(`✅ Parámetro ${name} guardado`);
  } catch (error) {
    console.error(`❌ Error guardando parámetro ${name}:`, error.message);
    throw error;
  }
}

module.exports = {
  getParameter,
  getParametersByPath,
  putParameter
};
