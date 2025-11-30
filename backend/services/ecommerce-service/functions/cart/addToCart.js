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
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || 'Products-local';

async function addToCart(event) {
  try {
    const userId = event.requestContext.authorizer.userId;
    const { productId, quantity = 1 } = JSON.parse(event.body);

    if (!productId || quantity < 1) {
      return {
        statusCode: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'productId y quantity son requeridos'
        })
      };
    }

    // Verificar que el producto existe
    const productResult = await dynamodb.get({
      TableName: PRODUCTS_TABLE,
      Key: { productId }
    }).promise();

    if (!productResult.Item) {
      return {
        statusCode: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Producto no encontrado'
        })
      };
    }

    const product = productResult.Item;

    if (!product.isAvailable) {
      return {
        statusCode: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Producto no disponible'
        })
      };
    }

    // Obtener carrito actual
    const cartResult = await dynamodb.get({
      TableName: CARTS_TABLE,
      Key: { userId }
    }).promise();

    let cart = cartResult.Item || {
      userId,
      items: [],
      total: 0,
      itemCount: 0,
      createdAt: new Date().toISOString()
    };

    // Buscar si el producto ya está en el carrito
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

    if (existingItemIndex >= 0) {
      // Actualizar cantidad
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].subtotal = cart.items[existingItemIndex].quantity * product.price;
    } else {
      // Agregar nuevo item
      cart.items.push({
        productId,
        name: product.name,
        price: product.price,
        quantity,
        subtotal: product.price * quantity,
        imageUrl: product.imageUrl || null
      });
    }

    // Recalcular totales
    cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.updatedAt = new Date().toISOString();

    // Guardar carrito
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
        error: 'Error al agregar al carrito'
      })
    };
  }
}

module.exports.handler = addToCart;
