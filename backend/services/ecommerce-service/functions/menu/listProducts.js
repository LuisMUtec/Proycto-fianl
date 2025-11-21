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
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || 'Products-local';

async function listProducts(event) {
  try {
    const { tenantId, category, available } = event.queryStringParameters || {};

    let params = {
      TableName: PRODUCTS_TABLE
    };

    // Si hay tenantId y category, usar el índice
    if (tenantId && category) {
      params = {
        TableName: PRODUCTS_TABLE,
        IndexName: 'tenantId-category-index',
        KeyConditionExpression: 'tenantId = :tenantId AND category = :category',
        ExpressionAttributeValues: {
          ':tenantId': tenantId,
          ':category': category
        }
      };
      
      const result = await dynamodb.query(params).promise();
      let products = result.Items;

      // Filtrar por disponibilidad si se especifica
      if (available === 'true') {
        products = products.filter(p => p.isAvailable === true);
      }

      return {
        statusCode: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          data: products,
          count: products.length
        })
      };
    }

    // Si solo hay tenantId, escanear filtrando
    if (tenantId) {
      params.FilterExpression = 'tenantId = :tenantId';
      params.ExpressionAttributeValues = { ':tenantId': tenantId };
    }

    const result = await dynamodb.scan(params).promise();
    let products = result.Items;

    // Filtrar por disponibilidad
    if (available === 'true') {
      products = products.filter(p => p.isAvailable === true);
    }

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: products,
        count: products.length
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
        error: 'Error al obtener productos'
      })
    };
  }
}

module.exports.handler = listProducts;
