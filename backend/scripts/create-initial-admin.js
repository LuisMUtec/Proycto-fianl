const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

AWS.config.region = 'us-east-1';
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createAdminUser() {
  console.log('👤 Creando usuario Admin inicial...\n');
  
  const email = 'admin@fridays.pe';
  const password = 'Admin123!';
  const passwordHash = await bcrypt.hashSync(password, 10);
  
  const adminUser = {
    userId: uuidv4(),
    email: email,
    passwordHash: passwordHash,
    firstName: 'Admin',
    lastName: 'Principal',
    role: 'Admin Sede',
    tenant_id: 'TENANT#001',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  try {
    // Verificar si ya existe
    const existing = await dynamodb.query({
      TableName: 'Users-dev',
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email }
    }).promise();
    
    if (existing.Items && existing.Items.length > 0) {
      console.log('⚠️  Usuario admin ya existe:');
      console.log('   Email:', existing.Items[0].email);
      console.log('   Role:', existing.Items[0].role);
      console.log('   UserId:', existing.Items[0].userId);
      console.log('\n💡 Puedes hacer login con:');
      console.log('   Email:', email);
      console.log('   Password:', password);
      return;
    }
    
    // Crear nuevo admin
    await dynamodb.put({
      TableName: 'Users-dev',
      Item: adminUser
    }).promise();
    
    console.log('✅ Usuario Admin creado exitosamente!\n');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 UserId:', adminUser.userId);
    console.log('🏢 TenantId:', adminUser.tenant_id);
    console.log('🎭 Role:', adminUser.role);
    console.log('\n💡 Usa estas credenciales para hacer login y obtener un token.\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAdminUser();
