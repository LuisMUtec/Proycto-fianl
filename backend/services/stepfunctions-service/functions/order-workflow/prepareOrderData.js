/**
 * Step Functions Lambda: PrepareOrderData
 * Validate products and calculate total
 */

const { getItem } = require('../../shared/database/dynamodb-client');

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;

module.exports.handler = async (event) => {
  try {
    const { items } = event;
    
    let total = 0;
    const validatedItems = [];
    
    for (const item of items) {
      const product = await getItem(PRODUCTS_TABLE, { productId: item.productId });
      
      if (!product) {
        throw new Error(`Producto ${item.productId} no encontrado`);
      }
      
      if (!product.isAvailable) {
        throw new Error(`Producto ${product.name} no disponible`);
      }
      
      const itemTotal = product.price * item.quantity;
      total += itemTotal;
      
      validatedItems.push({
        productId: product.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: itemTotal
      });
    }
    
    return {
      ...event,
      validatedItems,
      total
    };
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
};
