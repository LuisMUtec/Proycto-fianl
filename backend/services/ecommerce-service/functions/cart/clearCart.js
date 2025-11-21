const AWS = require('aws-sdk');
const { mockAuth } = require('../../../../shared/middlewares/mock-auth');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const CARTS_TABLE = process.env.CARTS_TABLE;

async function clearCart(event) {
  try {
    const user = event.requestContext.authorizer;

    await dynamodb.delete({
      TableName: CARTS_TABLE,
      Key: { userId: user.userId }
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true, 
        message: 'Carrito vaciado exitosamente' 
      })
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

module.exports.handler = mockAuth(clearCart);
