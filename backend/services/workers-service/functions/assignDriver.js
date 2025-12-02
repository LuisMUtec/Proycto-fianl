// Lambda: AssignDriver
// Busca drivers libres y cercanos al tenant/sede, asigna el óptimo

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { tenant_id, sedeLocation } = event;
  // 1. Consulta drivers libres
  const drivers = await dynamodb.scan({
    TableName: 'Drivers',
    FilterExpression: '#status = :free',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':free': 'FREE' }
  }).promise();

  // 2. Calcula distancia y filtra cercanos
  const nearbyDrivers = drivers.Items.filter(driver => {
    // Suponiendo que driver.location tiene lat/lng
    return getDistance(driver.location, sedeLocation) < 3000; // <3km
  });

  // 3. Selecciona el más cercano
  const selected = nearbyDrivers[0];

  if (selected) {
    // 4. Actualiza driver y retorna datos
    await dynamodb.update({
      TableName: 'Orders',
      Key: { orderId: event.orderId },
      UpdateExpression: 'set driverInfo = :driver, status = :status',
      ExpressionAttributeValues: {
        ':driver': selected,
        ':status': 'DELIVERING'
      }
    }).promise();
    return { driverAssigned: true, driver: selected };
  }

  return { driverAssigned: false };
};

function getDistance(loc1, loc2) {
  // Haversine formula (simplificada)
  const toRad = x => x * Math.PI / 180;
  const R = 6371e3;
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLng = toRad(loc2.lng - loc1.lng);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
