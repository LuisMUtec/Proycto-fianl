```json
{
  "userId": "UUID",                        // PK de la tabla

  "tenantId": "TENANT#001",                // Sede/restaurante al que pertenece
                                           // Para clientes puede ser null o no estar



  "role": "USER",                          // USER | DISPATCHER | COOK | ADMIN

  "firstName": "Leonardo",
  
  "lastName": "Sanchez",

  "email": "leonardo@gmail.com",
  
  "phoneNumber": "+51912345678",
  
  "address": "direccion random",

  

  "status": "ACTIVE",                      // ACTIVE | INACTIVE | BANNED...


  "locationLat": -12.046374,               // opcional: para clientes
  "locationLng": -77.042793,               // (lat/lng para Google Maps)

  

  "createdAt": "2025-11-17T15:32:00Z",
  "updatedAt": "2025-11-17T15:32:00Z"
  
}
```
