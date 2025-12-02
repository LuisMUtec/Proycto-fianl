# OrderWorkflow (AWS Step Functions)

El `OrderWorkflow` es una máquina de estados de AWS Step Functions responsable de **crear una nueva orden** en el sistema y notificar a otros componentes mediante eventos.

Participan las siguientes Lambdas:

- `PrepareOrderData` (Lambda)
- `PersistAndBuildOrder` (Lambda)  ← en el diagrama `Persist&BuildOrder`
- `PublishOrderCreatedEvent` (Lambda)

Y los siguientes servicios externos:

- DynamoDB: tabla `orders`
- EventBridge: publicación de evento `ORDER_CREATED`
- API Gateway HTTP: entrada al workflow
- API Gateway WS + `orderEventsToWS` (fuera del scope de este workflow, pero consumen el evento emitido)

---

## Flujo general

1. El frontend envía una petición HTTP para crear una orden:
   - `Frontend -> API Gateway HTTP -> OrderWorkflow (Step Functions)`

2. Step Functions ejecuta los estados:
   1. **`PrepareOrderData`**
   2. **`PersistAndBuildOrder`**
   3. **`PublishOrderCreatedEvent`**

3. Si todo es exitoso, el workflow termina en `Succeed` y devuelve al cliente un objeto de orden creado.

En caso de error en cualquiera de los pasos, el workflow puede:
- Hacer reintentos configurados.
- Terminar en un estado `Fail`.
- (Opcional) Publicar un evento de fallo en una evolución futura.

---

## Payload de entrada al workflow

El `OrderWorkflow` recibe como entrada un JSON similar a (en caso no sea identico adaptarlo al la entrada correspondiente):

```json
{
  "requestId": "uuid-generado-por-api-gw-o-frontend",
  "tenantId": "TENANT_123",
  "userId": "USER_456",
  "source": "web-app",
  "items": [
    {
      "productId": "PROD_1",
      "quantity": 2
    },
    {
      "productId": "PROD_2",
      "quantity": 1
    }
  ],
  "notes": "Sin cebolla, por favor",
  "paymentMethod": "CASH"
}
