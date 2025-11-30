// Script para crear tablas de DynamoDB en AWS
const AWS = require('aws-sdk');

// Configurar AWS - usa las credenciales del ambiente (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN)
AWS.config.region = 'us-east-1';

const dynamodb = new AWS.DynamoDB();

const stage = process.env.STAGE || 'dev';

const tables = [
  {
    TableName: `Users-${stage}`,
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' },
      { AttributeName: 'tenantId', AttributeType: 'S' },
      { AttributeName: 'role', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'email-index',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'tenantId-role-index',
        KeySchema: [
          { AttributeName: 'tenantId', KeyType: 'HASH' },
          { AttributeName: 'role', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  {
    TableName: `Tenants-${stage}`,
    KeySchema: [
      { AttributeName: 'tenantId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'tenantId', AttributeType: 'S' },
      { AttributeName: 'code', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'code-index',
        KeySchema: [
          { AttributeName: 'code', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  {
    TableName: `Products-${stage}`,
    KeySchema: [
      { AttributeName: 'productId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'productId', AttributeType: 'S' },
      { AttributeName: 'tenantId', AttributeType: 'S' },
      { AttributeName: 'category', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'tenantId-category-index',
        KeySchema: [
          { AttributeName: 'tenantId', KeyType: 'HASH' },
          { AttributeName: 'category', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  {
    TableName: `Orders-${stage}`,
    KeySchema: [
      { AttributeName: 'orderId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'orderId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'tenantId', AttributeType: 'S' },
      { AttributeName: 'status', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'userId-createdAt-index',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'tenantId-createdAt-index',
        KeySchema: [
          { AttributeName: 'tenantId', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'tenantId-status-index',
        KeySchema: [
          { AttributeName: 'tenantId', KeyType: 'HASH' },
          { AttributeName: 'status', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  {
    TableName: `WSConnections-${stage}`,
    KeySchema: [
      { AttributeName: 'connectionId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'connectionId', AttributeType: 'S' },
      { AttributeName: 'tenantId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'tenantId-index',
        KeySchema: [
          { AttributeName: 'tenantId', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    },
    TimeToLiveSpecification: {
      Enabled: true,
      AttributeName: 'ttl'
    }
  },
  {
    TableName: `Carts-${stage}`,
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  }
];

async function createTables() {
  console.log(`🚀 Creando tablas de DynamoDB en AWS (stage: ${stage})...\n`);

  for (const tableSchema of tables) {
    try {
      // Verificar si la tabla ya existe
      try {
        await dynamodb.describeTable({ TableName: tableSchema.TableName }).promise();
        console.log(`⚠️  La tabla ${tableSchema.TableName} ya existe, omitiendo...`);
        continue;
      } catch (err) {
        if (err.code !== 'ResourceNotFoundException') {
          throw err;
        }
      }

      // Crear la tabla
      await dynamodb.createTable(tableSchema).promise();
      console.log(`✅ Tabla ${tableSchema.TableName} creada exitosamente`);

      // Esperar a que la tabla esté activa
      console.log(`   ⏳ Esperando a que ${tableSchema.TableName} esté activa...`);
      await dynamodb.waitFor('tableExists', { TableName: tableSchema.TableName }).promise();
      console.log(`   ✅ ${tableSchema.TableName} está activa\n`);

    } catch (error) {
      console.error(`❌ Error creando tabla ${tableSchema.TableName}:`, error.message);
    }
  }

  console.log('\n✨ Proceso completado!\n');
  console.log('📋 Tablas creadas:');
  const listResult = await dynamodb.listTables().promise();
  listResult.TableNames
    .filter(name => name.endsWith(`-${stage}`))
    .forEach(name => console.log(`  - ${name}`));
}

createTables().catch(console.error);
