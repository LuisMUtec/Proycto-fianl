/**
 * Lambda: POST /orders (Checkout)
 * Roles: Cliente
 * 
 * Flujo completo:
 * 1. Validar carrito
 * 2. Simular pago
 * 3. Crear orden
 * 4. Invocar Step Function para procesamiento
 * 5. Vaciar carrito
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamoConfig = process.env.STAGE === 'local' 
  ? {
      region: 'us-east-1',
      endpoint: 'http://localhost:8000',
      accessKeyId: 'dummy',
      secretAccessKey: 'dummy'
    }
  : {};

const dynamodb = new AWS.DynamoDB.DocumentClient(dynamoConfig);
const stepfunctions = new AWS.StepFunctions();

const CARTS_TABLE = process.env.CARTS_TABLE || 'Carts-dev';
const ORDERS_TABLE = process.env.ORDERS_TABLE || 'Orders-dev';
const USERS_TABLE = process.env.USERS_TABLE || 'Users-dev';
const STEP_FUNCTION_ARN = process.env.ORDER_PROCESSING_STATE_MACHINE_ARN;

/**
 * Simular procesamiento de pago (1-click payment)
 */
async function simulatePayment(orderId, amount, paymentMethod) {
  console.log(`💳 Simulando pago para orden ${orderId}: ${amount} PEN via ${paymentMethod}`);
  
  // Simular delay de procesamiento (100ms)
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Simular éxito del pago (95% de éxito)
  const success = Math.random() > 0.05;
  
  if (!success) {
    throw new Error('Pago rechazado - Intente nuevamente');
  }
  
  const transactionId = `TXN#${uuidv4().substring(0, 8).toUpperCase()}`;
  
  console.log(`✅ Pago exitoso - Transaction ID: ${transactionId}`);
  
  return {
    success: true,
    transactionId,
    amount,
    currency: 'PEN',
    paymentMethod,
    processedAt: new Date().toISOString()
  };
}

async function checkout(event) {
  try {
    const userId = event.requestContext.authorizer.userId;
    const { tenant_id, deliveryAddress, paymentMethod, notes } = JSON.parse(event.body);

    if (!tenant_id || !deliveryAddress) {
      return {
        statusCode: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'tenant_id y deliveryAddress son requeridos'
        })
      };
    }

    // Obtener carrito
    const cartResult = await dynamodb.get({
      TableName: CARTS_TABLE,
      Key: { userId }
    }).promise();

    if (!cartResult.Item || cartResult.Item.items.length === 0) {
      return {
        statusCode: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'El carrito está vacío'
        })
      };
    }

    const cart = cartResult.Item;

    // Obtener información del usuario
    const userResult = await dynamodb.get({
      TableName: USERS_TABLE,
      Key: { userId }
    }).promise();

    const user = userResult.Item || {};

    // Preparar datos de la orden
    const orderId = `ORDER#${uuidv4()}`;
    const now = new Date().toISOString();
    const deliveryFee = 5.00;
    const totalAmount = cart.total + deliveryFee;

    console.log(`📦 Procesando checkout para usuario ${userId}, total: ${totalAmount} PEN`);

    // PASO 1: Simular pago (debe completarse antes de crear la orden)
    let paymentResult;
    try {
      paymentResult = await simulatePayment(orderId, totalAmount, paymentMethod || 'CARD');
    } catch (paymentError) {
      console.error('❌ Error en el pago:', paymentError.message);
      return {
        statusCode: 402,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: paymentError.message,
          code: 'PAYMENT_FAILED'
        })
      };
    }

    // PASO 2: Crear orden con pago confirmado
    const order = {
      orderId,
      userId,
      tenant_id,
      status: 'CREATED',
      items: cart.items,
      subtotal: cart.total,
      deliveryFee,
      total: totalAmount,
      currency: 'PEN',
      deliveryAddress: {
        ...deliveryAddress,
        lat: user.locationLat || null,
        lng: user.locationLng || null
      },
      customerInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email
      },
      paymentMethod: paymentResult.paymentMethod,
      paymentStatus: 'COMPLETED',
      paymentDetails: {
        transactionId: paymentResult.transactionId,
        processedAt: paymentResult.processedAt
      },
      notes: notes || null,
      createdAt: now,
      updatedAt: now
    };

    // Guardar orden en DynamoDB
    await dynamodb.put({
      TableName: ORDERS_TABLE,
      Item: order
    }).promise();

    console.log(`✅ Orden ${orderId} guardada exitosamente`);

    // PASO 3: Vaciar carrito
    await dynamodb.delete({
      TableName: CARTS_TABLE,
      Key: { userId }
    }).promise();

    console.log(`🗑️ Carrito vaciado para usuario ${userId}`);

    // PASO 4: Invocar Step Function para procesamiento
    if (STEP_FUNCTION_ARN) {
      try {
        const sfnInput = {
          orderId,
          tenant_id,
          userId,
          items: order.items,
          total: order.total,
          deliveryAddress: order.deliveryAddress,
          timestamp: now
        };

        const execution = await stepfunctions.startExecution({
          stateMachineArn: STEP_FUNCTION_ARN,
          name: `order-${orderId}-${Date.now()}`,
          input: JSON.stringify(sfnInput)
        }).promise();

        console.log(`🔄 Step Function iniciada: ${execution.executionArn}`);
        
        order.stepFunctionExecution = {
          executionArn: execution.executionArn,
          startDate: execution.startDate
        };
      } catch (sfnError) {
        console.error('⚠️ Error al iniciar Step Function:', sfnError);
        // No fallar la orden, solo registrar el error
        order.stepFunctionError = sfnError.message;
      }
    } else {
      console.log('⚠️ Step Function ARN no configurado, saltando procesamiento');
    }

    return {
      statusCode: 201,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Orden creada y pago procesado exitosamente',
        data: {
          order,
          payment: {
            status: 'COMPLETED',
            transactionId: paymentResult.transactionId,
            amount: totalAmount,
            currency: 'PEN'
          }
        }
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Error al procesar el checkout'
      })
    };
  }
}

module.exports.handler = checkout;
