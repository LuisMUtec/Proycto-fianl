```json
{
  "orderId": "UUID",

  "tenantId": "TENANT#001",             // sede/restaurant dueño de esta orden

  "userId": "UUID-USER",                 // quién creó la orden
  
  "cookId": "UUID-COOK",                 // cocinero asignado (opcional puede ser nulo un tiempo)
  
  "dispatcherId": "UUID-DESP",           // despachador asignado (opcional puede ser nulo un tiempo)

  "status": "CREATED",                   // CREATED | COOKING | READY | DELIVERED | CANCELLED

  "createdAt": "2025-11-17T15:32:00Z",
  "updatedAt": "2025-11-17T15:40:00Z",

  "timeline": {                          // Timestamps por estado (opcional)
    "CREATED": "2025-11-17T15:32:00Z",
    "COOKING": "2025-11-17T15:35:00Z",
    "PACKAGED": "2025-11-17T15:40:00Z",
    "ON THE WAY": "date", 
    "DELIVERED": null
  },

  "resolvedAt": null,                    // cuándo terminó todo el ciclo

  "items": [                             // lista de productos (snapshot)
    {
      
      "productId": "PRODUCT#001",
      "quantity": 2,
      "unitPrice": 18.5,               // snapshot
      "quantity": 2
     
    },
    
    
    
    {
      
      "productId": "PRODUCT#003"
      "quantity": 1,
      "unitrice": 18.5,               // snapshot
      "quantity": 2 
    }
    
    
  ],

  "total": 42.0
}
```
