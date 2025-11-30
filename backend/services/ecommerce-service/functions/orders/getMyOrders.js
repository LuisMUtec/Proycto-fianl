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
const ORDERS_TABLE = process.env.ORDERS_TABLE || 'Orders-local';

async function getMyOrders(event) {
  try {
    const userId = event.requestContext.authorizer.userId;

    const result = await dynamodb.query({
      TableName: ORDERS_TABLE,
      IndexName: 'userId-createdAt-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false // Ordenar descendente (más recientes primero)
    }).promise();

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: result.Items,
        count: result.Items.length
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
        error: 'Error al obtener órdenes'
      })
    };
  }
}

module.exports.handler = getMyOrders;
