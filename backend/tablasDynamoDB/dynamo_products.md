```json
{
  "productId": "PRODUCT#001",             // PK en Dynamo

  "tenantId": "TENANT#001",               // a qué sede pertenece

  "name": "Hamburguesa Clásica",
  
  "description": "Hamburguesa con queso, lechuga y tomate",
  
  "category": "FOOD",                     // FOOD | DRINK | DESSERT | COMBO...

  "price": 18.5,
  
  "currency": "PEN",

  "isAvailable": true,
  
  "preparationTimeMinutes": 15,

  "imageKey": "images/tenant-001/burger-001.jpg",
  "imageUrl": "https://mi-bucket.s3.amazonaws.com/images/tenant-001/burger-001.jpg",

  "tags": ["burger", "carne", "combo1"],  // opcional: filtros, búsqueda


  "createdAt": "2025-11-17T15:32:00Z",
  "updatedAt": "2025-11-17T15:32:00Z",
  "createdBy": "USER#ADMIN1",
  "updatedBy": "USER#ADMIN1"
}
```
