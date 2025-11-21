// Script para poblar datos de prueba en DynamoDB AWS
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configurar AWS con el perfil fridays-dev
const credentials = new AWS.SharedIniFileCredentials({ profile: 'fridays-dev' });
AWS.config.credentials = credentials;
AWS.config.region = 'us-east-1';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const stage = process.env.STAGE || 'dev';

const seedData = {
  // Sedes
  tenants: [
    {
      tenantId: 'TENANT#001',
      name: 'Fridays San Isidro',
      code: 'SAN-ISIDRO',
      address: 'Av. Javier Prado Este 4200, San Isidro',
      lat: -12.09483,
      lng: -77.03302,
      status: 'ACTIVE',
      phone: '+5112345678',
      email: 'sanisidro@fridays.pe',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      tenantId: 'TENANT#002',
      name: 'Fridays Miraflores',
      code: 'MIRAFLORES',
      address: 'Av. Larco 1301, Miraflores',
      lat: -12.12345,
      lng: -77.02890,
      status: 'ACTIVE',
      phone: '+5118765432',
      email: 'miraflores@fridays.pe',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],

  // Usuarios
  users: [
    {
      userId: uuidv4(),
      role: 'CLIENTE',
      firstName: 'Leonardo',
      lastName: 'Sanchez',
      email: 'leonardo@gmail.com',
      passwordHash: '$2b$10$dummyHashForDev',
      phoneNumber: '+51912345678',
      status: 'ACTIVE',
      locationLat: -12.046374,
      locationLng: -77.042793,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      userId: uuidv4(),
      tenantId: 'TENANT#001',
      role: 'DIGITADOR',
      firstName: 'Ana',
      lastName: 'Torres',
      email: 'ana.digitador@fridays.pe',
      passwordHash: '$2b$10$dummyHashForDev',
      phoneNumber: '+51987654321',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      userId: uuidv4(),
      tenantId: 'TENANT#001',
      role: 'CHEF_EJECUTIVO',
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      email: 'carlos.chef@fridays.pe',
      passwordHash: '$2b$10$dummyHashForDev',
      phoneNumber: '+51923456789',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      userId: uuidv4(),
      tenantId: 'TENANT#001',
      role: 'COCINERO',
      firstName: 'Luis',
      lastName: 'Gomez',
      email: 'luis.cocinero@fridays.pe',
      passwordHash: '$2b$10$dummyHashForDev',
      phoneNumber: '+51945678901',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      userId: uuidv4(),
      tenantId: 'TENANT#001',
      role: 'EMPACADOR',
      firstName: 'Jose',
      lastName: 'Perez',
      email: 'jose.empacador@fridays.pe',
      passwordHash: '$2b$10$dummyHashForDev',
      phoneNumber: '+51956789012',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      userId: uuidv4(),
      tenantId: 'TENANT#001',
      role: 'REPARTIDOR',
      firstName: 'Maria',
      lastName: 'Lopez',
      email: 'maria.repartidor@fridays.pe',
      passwordHash: '$2b$10$dummyHashForDev',
      phoneNumber: '+51967890123',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      userId: uuidv4(),
      tenantId: 'TENANT#001',
      role: 'ADMIN_SEDE',
      firstName: 'Admin',
      lastName: 'Principal',
      email: 'admin@fridays.pe',
      passwordHash: '$2b$10$dummyHashForDev',
      phoneNumber: '+51978901234',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],

  // Productos
  products: [
    {
      productId: 'PRODUCT#001',
      tenantId: 'TENANT#001',
      name: 'Hamburguesa Clásica',
      description: 'Jugosa hamburguesa de carne 180g con queso cheddar, lechuga, tomate y nuestra salsa especial',
      category: 'FOOD',
      price: 28.90,
      currency: 'PEN',
      isAvailable: true,
      preparationTimeMinutes: 15,
      imageKey: 'images/tenant-001/burger-001.jpg',
      imageUrl: 'https://via.placeholder.com/300x200?text=Hamburguesa+Clasica',
      tags: ['burger', 'carne', 'popular'],
      nutritionalInfo: {
        calories: 650,
        protein: 32,
        carbs: 48,
        fat: 35
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      productId: 'PRODUCT#002',
      tenantId: 'TENANT#001',
      name: 'Alitas BBQ (12 unidades)',
      description: 'Deliciosas alitas de pollo bañadas en salsa BBQ casera',
      category: 'FOOD',
      price: 32.90,
      currency: 'PEN',
      isAvailable: true,
      preparationTimeMinutes: 20,
      imageKey: 'images/tenant-001/wings-001.jpg',
      imageUrl: 'https://via.placeholder.com/300x200?text=Alitas+BBQ',
      tags: ['wings', 'pollo', 'bbq'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      productId: 'PRODUCT#003',
      tenantId: 'TENANT#001',
      name: 'Coca Cola 500ml',
      description: 'Refresco Coca Cola en botella de 500ml',
      category: 'DRINK',
      price: 5.00,
      currency: 'PEN',
      isAvailable: true,
      preparationTimeMinutes: 1,
      imageKey: 'images/tenant-001/coca-cola.jpg',
      imageUrl: 'https://via.placeholder.com/300x200?text=Coca+Cola',
      tags: ['drink', 'soda', 'coca-cola'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      productId: 'PRODUCT#004',
      tenantId: 'TENANT#001',
      name: 'Cheesecake de Fresa',
      description: 'Exquisito cheesecake con cobertura de fresas frescas',
      category: 'DESSERT',
      price: 18.00,
      currency: 'PEN',
      isAvailable: true,
      preparationTimeMinutes: 5,
      imageKey: 'images/tenant-001/cheesecake.jpg',
      imageUrl: 'https://via.placeholder.com/300x200?text=Cheesecake',
      tags: ['dessert', 'cake', 'strawberry'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};

async function seedDatabase() {
  console.log(`🌱 Seeding AWS DynamoDB (stage: ${stage})...\n`);

  try {
    // Insertar Tenants
    console.log('📍 Inserting Tenants...');
    for (const tenant of seedData.tenants) {
      await dynamodb.put({
        TableName: `Tenants-${stage}`,
        Item: tenant
      }).promise();
      console.log(`  ✅ ${tenant.name}`);
    }

    // Insertar Users
    console.log('\n👥 Inserting Users...');
    for (const user of seedData.users) {
      await dynamodb.put({
        TableName: `Users-${stage}`,
        Item: user
      }).promise();
      console.log(`  ✅ ${user.firstName} ${user.lastName} (${user.role})`);
    }

    // Insertar Products
    console.log('\n🍔 Inserting Products...');
    for (const product of seedData.products) {
      await dynamodb.put({
        TableName: `Products-${stage}`,
        Item: product
      }).promise();
      console.log(`  ✅ ${product.name} - S/.${product.price}`);
    }

    console.log('\n✨ AWS Database seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`  - Tenants: ${seedData.tenants.length}`);
    console.log(`  - Users: ${seedData.users.length}`);
    console.log(`  - Products: ${seedData.products.length}`);
    console.log('\n🔐 Test Credentials (use estos emails para generar JWT):');
    console.log('  - Cliente: leonardo@gmail.com');
    console.log('  - Digitador: ana.digitador@fridays.pe');
    console.log('  - Chef Ejecutivo: carlos.chef@fridays.pe');
    console.log('  - Cocinero: luis.cocinero@fridays.pe');
    console.log('  - Empacador: jose.empacador@fridays.pe');
    console.log('  - Repartidor: maria.repartidor@fridays.pe');
    console.log('  - Admin Sede: admin@fridays.pe');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Ejecutar
seedDatabase().catch(console.error);
