/**
 * Estados de órdenes del sistema Fridays Perú
 */

module.exports = {
  ORDER_STATUS: {
    CREATED: 'CREATED',         // Orden creada por cliente
    COOKING: 'COOKING',         // Asignada a cocinero, en preparación
    READY: 'READY',             // Lista para entregar
    DELIVERING: 'DELIVERING',   // Repartidor en camino
    DELIVERED: 'DELIVERED',     // Entregada al cliente
    CANCELLED: 'CANCELLED'      // Cancelada
  },
  
  // Transiciones válidas
  TRANSITIONS: {
    'CREATED': ['COOKING', 'CANCELLED'],
    'COOKING': ['READY', 'CANCELLED'],
    'READY': ['DELIVERING', 'CANCELLED'],
    'DELIVERING': ['DELIVERED', 'CANCELLED'],
    'DELIVERED': [],
    'CANCELLED': []
  },

  // Helper: Verificar si una transición es válida
  isValidTransition: (from, to) => {
    const transitions = module.exports.TRANSITIONS[from];
    return transitions && transitions.includes(to);
  }
};
