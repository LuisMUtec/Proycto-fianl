const AWS = require('aws-sdk');
const { mockAuth } = require('../../../../shared/middlewares/mock-auth');
const { USER_ROLES } = require('../../../../shared/constants/user-roles');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const USERS_TABLE = process.env.USERS_TABLE;

async function listDrivers(event) {
  try {
    const user = event.requestContext.authorizer;

    // Obtener todos los repartidores del tenant
    const result = await dynamodb.query({
      TableName: USERS_TABLE,
      IndexName: 'tenantId-role-index',
      KeyConditionExpression: 'tenantId = :tenantId AND #role = :role',
      ExpressionAttributeNames: {
        '#role': 'role'
      },
      ExpressionAttributeValues: {
        ':tenantId': user.tenantId,
        ':role': USER_ROLES.REPARTIDOR
      }
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        data: result.Items.map(driver => ({
          userId: driver.userId,
          firstName: driver.firstName,
          lastName: driver.lastName,
          email: driver.email,
          phoneNumber: driver.phoneNumber,
          status: driver.status,
          createdAt: driver.createdAt
        }))
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, error: 'Error interno del servidor' })
    };
  }
}

module.exports.handler = mockAuth(listDrivers);
