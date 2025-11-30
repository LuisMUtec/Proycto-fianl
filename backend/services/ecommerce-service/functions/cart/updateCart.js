const AWS = require('aws-sdk');
const { mockAuth } = require('../../shared/middlewares/mock-auth');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const CARTS_TABLE = process.env.CARTS_TABLE;

async function updateCart(event) {
  try {
    const user = event.requestContext.authorizer;
    const { productId, quantity } = JSON.parse(event.body);

    const cart = await dynamodb.get({
      TableName: CARTS_TABLE,
      Key: { userId: user.userId }
    }).promise();

    if (!cart.Item) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'Carrito no encontrado' })
      };
    }

    const items = cart.Item.items || [];
    const itemIndex = items.findIndex(i => i.productId === productId);

    if (itemIndex === -1) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'Producto no está en el carrito' })
      };
    }

    if (quantity <= 0) {
      items.splice(itemIndex, 1);
    } else {
      items[itemIndex].quantity = quantity;
    }

    await dynamodb.put({
      TableName: CARTS_TABLE,
      Item: {
        userId: user.userId,
        items,
        updatedAt: new Date().toISOString()
      }
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, data: { items } })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, error: 'Error interno' })
    };
  }
}

module.exports.handler = mockAuth(updateCart);
