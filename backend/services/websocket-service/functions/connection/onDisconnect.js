const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE;

async function onDisconnect(event) {
  try {
    const connectionId = event.requestContext.connectionId;

    await dynamodb.delete({
      TableName: CONNECTIONS_TABLE,
      Key: { connectionId }
    }).promise();

    return {
      statusCode: 200,
      body: 'Disconnected'
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: 'Failed to disconnect'
    };
  }
}

module.exports.handler = onDisconnect;
