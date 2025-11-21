const AWS = require('aws-sdk');
const { mockAuth } = require('../../../../shared/middlewares/mock-auth');
const { USER_ROLES } = require('../../../../shared/constants/user-roles');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const ORDERS_TABLE = process.env.ORDERS_TABLE;
const USERS_TABLE = process.env.USERS_TABLE;
const TENANTS_TABLE = process.env.TENANTS_TABLE;

async function getDashboard(event) {
  try {
    const user = event.requestContext.authorizer;

    // Solo ADMIN_SEDE puede ver el dashboard
    if (user.role !== USER_ROLES.ADMIN_SEDE) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'No tienes permisos' })
      };
    }

    // Obtener órdenes del día
    const today = new Date().toISOString().split('T')[0];
    
    const ordersResult = await dynamodb.query({
      TableName: ORDERS_TABLE,
      IndexName: 'tenantId-createdAt-index',
      KeyConditionExpression: 'tenantId = :tenantId AND begins_with(createdAt, :today)',
      ExpressionAttributeValues: {
        ':tenantId': user.tenantId,
        ':today': today
      }
    }).promise();

    // Calcular estadísticas
    const orders = ordersResult.Items;
    const stats = {
      totalOrders: orders.length,
      ordersByStatus: {
        CREATED: orders.filter(o => o.status === 'CREATED').length,
        COOKING: orders.filter(o => o.status === 'COOKING').length,
        READY: orders.filter(o => o.status === 'READY').length,
        DELIVERING: orders.filter(o => o.status === 'DELIVERING').length,
        DELIVERED: orders.filter(o => o.status === 'DELIVERED').length,
        CANCELLED: orders.filter(o => o.status === 'CANCELLED').length
      },
      totalRevenue: orders
        .filter(o => o.status === 'DELIVERED')
        .reduce((sum, o) => sum + (o.total || 0), 0)
    };

    // Obtener personal activo
    const staffResult = await dynamodb.query({
      TableName: USERS_TABLE,
      IndexName: 'tenantId-role-index',
      KeyConditionExpression: 'tenantId = :tenantId',
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':tenantId': user.tenantId,
        ':status': 'ACTIVE'
      }
    }).promise();

    const staffByRole = {};
    staffResult.Items.forEach(staff => {
      staffByRole[staff.role] = (staffByRole[staff.role] || 0) + 1;
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        data: {
          date: today,
          orders: stats,
          staff: {
            total: staffResult.Items.length,
            byRole: staffByRole
          }
        }
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

module.exports.handler = mockAuth(getDashboard);
