/**
 * Lambda: GET /menu/search?q
 * Roles: PUBLIC/CLIENTE
 */

const { scan } = require('../../shared/database/dynamodb-client');
const { success, badRequest, serverError } = require('../../shared/utils/response');

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;

module.exports.handler = async (event) => {
  try {
    const query = event.queryStringParameters?.q;
    
    if (!query) {
      return badRequest('Parámetro q requerido');
    }
    
    console.log('🔍 Buscando:', query);
    
    // Obtener todos los productos disponibles
    const allProducts = await scan(
      PRODUCTS_TABLE,
      'isAvailable = :available',
      { ':available': true }
    );
    
    console.log(`📦 Total productos disponibles: ${allProducts.length}`);
    
    // Filtrar en memoria (case-insensitive)
    const queryLower = query.toLowerCase();
    const products = allProducts.filter(product => {
      const nameMatch = product.name?.toLowerCase().includes(queryLower);
      const descMatch = product.description?.toLowerCase().includes(queryLower);
      const tagsMatch = product.tags?.some(tag => tag.toLowerCase().includes(queryLower));
      
      return nameMatch || descMatch || tagsMatch;
    });
    
    console.log(`✅ Encontrados: ${products.length} productos`);
    
    return success({ 
      query, 
      results: products.length, 
      products 
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error en búsqueda', error);
  }
};
