const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamoConfig = process.env.STAGE === 'local' 
  ? {
      region: 'us-east-1',
      endpoint: 'http://localhost:8000',
      accessKeyId: 'dummy',
      secretAccessKey: 'dummy'
    }
  : {};

const dynamodb = new AWS.DynamoDB.DocumentClient(dynamoConfig);
const eventBridge = new AWS.EventBridge();

const CARTS_TABLE = process.env.CARTS_TABLE || 'Carts-local';
const ORDERS_TABLE = process.env.ORDERS_TABLE || 'Orders-local';
const USERS_TABLE = process.env.USERS_TABLE || 'Users-local';

async function checkout(event) {
  try {
    const userId = event.requestContext.authorizer.userId;
    const { tenantId, deliveryAddress, paymentMethod, notes } = JSON.parse(event.body);

    if (!tenantId || !deliveryAddress) {
      return {
        statusCode: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'tenantId y deliveryAddress son requeridos'
        })
      };
    }

    // Obtener carrito
    const cartResult = await dynamodb.get({
      TableName: CARTS_TABLE,
      Key: { userId }
    }).promise();

    if (!cartResult.Item || cartResult.Item.items.length === 0) {
      return {
        statusCode: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'El carrito está vacío'
        })
      };
    }

    const cart = cartResult.Item;

    // Obtener información del usuario
    const userResult = await dynamodb.get({
      TableName: USERS_TABLE,
      // La tabla actual usa 'id' como clave primaria; usar id = userId
      Key: { id: userId }
    }).promise();

    const user = userResult.Item || {};

    // Crear orden
    const orderId = `ORDER#${uuidv4()}`;
    const now = new Date().toISOString();

    const order = {
      orderId,
      userId,
      tenantId,
      status: 'CREATED',
      items: cart.items,
      subtotal: cart.total,
      deliveryFee: 5.00,
      total: cart.total + 5.00,
      currency: 'PEN',
      deliveryAddress: {
        ...deliveryAddress,
        lat: user.locationLat || null,
        lng: user.locationLng || null
      },
      customerInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email
      },
      paymentMethod: paymentMethod || 'CASH',
      paymentStatus: 'PENDING',
      notes: notes || null,
      createdAt: now,
      updatedAt: now
    };

    // Guardar orden
    await dynamodb.put({
      TableName: ORDERS_TABLE,
      Item: order
    }).promise();

    // Vaciar carrito
    await dynamodb.delete({
      TableName: CARTS_TABLE,
      Key: { userId }
    }).promise();

    // Emitir evento para Kitchen Service
    await eventBridge.putEvents({
      Entries: [{
        Source: 'fridays.ecommerce',
        DetailType: 'OrderCreated',
        Detail: JSON.stringify({
          orderId,
          tenantId,
          userId,
          items: order.items,
          total: order.total,
          timestamp: now
        })
      }]
    }).promise();

    return {
      statusCode: 201,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Orden creada exitosamente',
        data: order
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
        error: 'Error al procesar el checkout'
      })
    };
  }
}

module.exports.handler = checkout;
