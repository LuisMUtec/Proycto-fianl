const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE;

async function register(event) {
  try {
    const { firstName, lastName, email, password, phoneNumber, address } = JSON.parse(event.body);

    if (!firstName || !lastName || !email || !password || !phoneNumber) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'Datos incompletos' })
      };
    }

    // Verificar email existente (GSI 'email-index' debe existir)
    let existing;
    try {
      existing = await dynamodb.query({
        TableName: USERS_TABLE,
        IndexName: 'email-index',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': email }
      }).promise();
    } catch (err) {
      console.error('DynamoDB query error (checking email):', err && err.message ? err.message : err);
      // Si la tabla o índice no existe, devolver un mensaje claro para el desarrollador
      if (err && err.code === 'ResourceNotFoundException') {
        const tableName = USERS_TABLE || `Users-${process.env.STAGE || 'dev'}`;
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ success: false, error: `Recurso no encontrado: tabla o índice ausente (${tableName}). Crear la tabla/índice y desplegar.` })
        };
      }

      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'Error al verificar email (ver logs)' })
      };
    }

    if (existing && existing.Items && existing.Items.length > 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'Email ya registrado' })
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
      userId: uuidv4(),
      role: 'CLIENTE',
      firstName,
      lastName,
      email,
      phoneNumber,
      passwordHash,
      address,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Alineación con la tabla existente: guardar también la clave 'id' (schema actual de Users-dev usa 'id' como PK)
    newUser.id = newUser.userId;

    await dynamodb.put({
      TableName: USERS_TABLE,
      Item: newUser
    }).promise();

    delete newUser.passwordHash;

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true, 
        message: 'Usuario registrado exitosamente',
        data: newUser 
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

module.exports.handler = register;
