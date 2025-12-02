const AWS = require('aws-sdk');

const dynamoConfig = process.env.STAGE === 'local' 
  ? {
      region: 'us-east-1',
      endpoint: 'http://localhost:8000',
      accessKeyId: 'dummy',
      secretAccessKey: 'dummy'
    }
  : {};

const dynamodb = new AWS.DynamoDB.DocumentClient(dynamoConfig);
const CARTS_TABLE = process.env.CARTS_TABLE || 'Carts-local';

async function removeFromCart(event) {
  try {
    const userId = event.requestContext.authorizer.userId;
    const { productId } = event.pathParameters;

    // Obtener carrito actual
    const cartResult = await dynamodb.get({
      TableName: CARTS_TABLE,
      Key: { userId }
    }).promise();

    if (!cartResult.Item) {
      return {
        statusCode: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Carrito no encontrado'
        })
      };
    }

    let cart = cartResult.Item;

  // Filtrar el producto (comparación robusta y logs)
  const normalizedProductId = decodeURIComponent(String(productId).trim()).toUpperCase();
  console.log('🛒 productId recibido:', normalizedProductId);
  console.log('🛒 items antes de filtrar:', cart.items.map(i => i.productId));
  cart.items = cart.items.filter(item => String(item.productId).trim().toUpperCase() !== normalizedProductId);
  console.log('🛒 items después de filtrar:', cart.items.map(i => i.productId));

  // Recalcular totales (manejar items sin subtotal)
  cart.total = cart.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  cart.itemCount = cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  cart.updatedAt = new Date().toISOString();

    // Si el carrito está vacío, eliminarlo
    if (cart.items.length === 0) {
      await dynamodb.delete({
        TableName: CARTS_TABLE,
        Key: { userId }
      }).promise();

      return {
        statusCode: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          message: 'Carrito vacío eliminado'
        })
      };
    }

    // Guardar carrito actualizado
    await dynamodb.put({
      TableName: CARTS_TABLE,
      Item: cart
    }).promise();

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: cart
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Error al remover del carrito'
      })
    };
  }
}

module.exports.handler = removeFromCart;
