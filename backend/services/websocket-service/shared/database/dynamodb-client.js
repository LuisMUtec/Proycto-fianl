/**
 * DynamoDB Client
 * 
 * ⚠️ SEGURIDAD:
 * - NO incluye credenciales
 * - Usa IAM Role de Lambda
 * - Compatible con AWS Academy
 */

const AWS = require('aws-sdk');

// Cliente DynamoDB usa IAM Role automáticamente
const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: process.env.REGION || process.env.AWS_REGION || 'us-east-1'
});

/**
 * Get item by primary key
 */
async function getItem(tableName, key) {
  try {
    const params = {
      TableName: tableName,
      Key: key
    };

    const result = await dynamodb.get(params).promise();
    return result.Item;
  } catch (error) {
    console.error(`❌ DynamoDB getItem error (${tableName}):`, error.message);
    throw error;
  }
}

/**
 * Put item (create or replace)
 */
async function putItem(tableName, item) {
  try {
    const params = {
      TableName: tableName,
      Item: item
    };

    await dynamodb.put(params).promise();
    return item;
  } catch (error) {
    console.error(`❌ DynamoDB putItem error (${tableName}):`, error.message);
    throw error;
  }
}

/**
 * Update item with UpdateExpression
 */
async function updateItem(tableName, key, updateExpression, expressionValues, expressionNames = {}) {
  try {
    const params = {
      TableName: tableName,
      Key: key,
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionValues,
      ReturnValues: 'ALL_NEW'
    };

    if (Object.keys(expressionNames).length > 0) {
      params.ExpressionAttributeNames = expressionNames;
    }

    const result = await dynamodb.update(params).promise();
    return result.Attributes;
  } catch (error) {
    console.error(`❌ DynamoDB updateItem error (${tableName}):`, error.message);
    throw error;
  }
}

/**
 * Delete item
 */
async function deleteItem(tableName, key) {
  try {
    const params = {
      TableName: tableName,
      Key: key
    };

    await dynamodb.delete(params).promise();
  } catch (error) {
    console.error(`❌ DynamoDB deleteItem error (${tableName}):`, error.message);
    throw error;
  }
}

/**
 * Query items with condition
 */
async function query(tableName, keyConditionExpression, expressionValues, indexName = null, limit = null) {
  try {
    const params = {
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionValues
    };

    if (indexName) {
      params.IndexName = indexName;
    }

    if (limit) {
      params.Limit = limit;
    }

    const result = await dynamodb.query(params).promise();
    return result.Items;
  } catch (error) {
    console.error(`❌ DynamoDB query error (${tableName}):`, error.message);
    throw error;
  }
}

/**
 * Scan table (use with caution)
 */
async function scan(tableName, filterExpression = null, expressionValues = {}, limit = null, expressionNames = {}) {
  try {
    const params = {
      TableName: tableName
    };

    if (filterExpression) {
      params.FilterExpression = filterExpression;
      params.ExpressionAttributeValues = expressionValues;
      
      if (Object.keys(expressionNames).length > 0) {
        params.ExpressionAttributeNames = expressionNames;
      }
    }

    if (limit) {
      params.Limit = limit;
    }

    const result = await dynamodb.scan(params).promise();
    return result.Items;
  } catch (error) {
    console.error(`❌ DynamoDB scan error (${tableName}):`, error.message);
    throw error;
  }
}

/**
 * Batch write (put/delete multiple items)
 */
async function batchWrite(tableName, items, operation = 'put') {
  try {
    const requests = items.map(item => {
      if (operation === 'put') {
        return {
          PutRequest: {
            Item: item
          }
        };
      } else {
        return {
          DeleteRequest: {
            Key: item
          }
        };
      }
    });

    const params = {
      RequestItems: {
        [tableName]: requests
      }
    };

    await dynamodb.batchWrite(params).promise();
  } catch (error) {
    console.error(`❌ DynamoDB batchWrite error (${tableName}):`, error.message);
    throw error;
  }
}

/**
 * Transaction write (atomic operations)
 */
async function transactWrite(transactItems) {
  try {
    const params = {
      TransactItems: transactItems
    };

    await dynamodb.transactWrite(params).promise();
  } catch (error) {
    console.error('❌ DynamoDB transactWrite error:', error.message);
    throw error;
  }
}

module.exports = {
  getItem,
  putItem,
  updateItem,
  deleteItem,
  query,
  scan,
  batchWrite,
  transactWrite
};
