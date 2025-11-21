const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;

exports.handler = async (event) => {
  try {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    // Obtener categoría del path parameter
    const category = event.pathParameters?.category;
    
    if (!category) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Category is required'
        })
      };
    }

    // Convertir categoría a mayúsculas para que coincida con los datos
    const categoryUpper = category.toUpperCase();

    console.log('Filtering products by category:', categoryUpper);

    // Escanear productos (en producción, usar GSI con category como clave)
    const params = {
      TableName: PRODUCTS_TABLE,
      FilterExpression: 'category = :category AND isAvailable = :available',
      ExpressionAttributeValues: {
        ':category': categoryUpper,
        ':available': true
      }
    };

    const result = await dynamodb.scan(params).promise();
    
    console.log('Products found:', result.Items.length);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: result.Items,
        count: result.Items.length,
        category: categoryUpper
      })
    };

  } catch (error) {
    console.error('Error getting products by category:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Error getting products by category',
        message: error.message
      })
    };
  }
};
