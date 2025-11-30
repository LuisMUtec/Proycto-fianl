/**
 * Response Utilities
 * Helper para generar respuestas HTTP consistentes
 */

/**
 * Respuesta exitosa (200)
 */
function success(data, message = 'Success') {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      success: true,
      message,
      data
    })
  };
}

/**
 * Respuesta creado (201)
 */
function created(data, message = 'Resource created') {
  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      success: true,
      message,
      data
    })
  };
}

/**
 * Respuesta sin contenido (204)
 */
function noContent() {
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ''
  };
}

/**
 * Error de validación (400)
 */
function badRequest(message = 'Bad Request', errors = null) {
  return {
    statusCode: 400,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      success: false,
      message,
      errors
    })
  };
}

/**
 * No autorizado (401)
 */
function unauthorized(message = 'Unauthorized') {
  return {
    statusCode: 401,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      success: false,
      message
    })
  };
}

/**
 * Prohibido (403)
 */
function forbidden(message = 'Forbidden') {
  return {
    statusCode: 403,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      success: false,
      message
    })
  };
}

/**
 * No encontrado (404)
 */
function notFound(message = 'Resource not found') {
  return {
    statusCode: 404,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      success: false,
      message
    })
  };
}

/**
 * Error interno del servidor (500)
 */
function serverError(message = 'Internal Server Error', error = null) {
  const body = {
    success: false,
    message
  };

  // Solo incluir detalles del error en desarrollo
  if (process.env.STAGE === 'local' || process.env.STAGE === 'dev') {
    body.error = error?.message || error;
  }

  return {
    statusCode: 500,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(body)
  };
}

module.exports = {
  success,
  created,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError
};
