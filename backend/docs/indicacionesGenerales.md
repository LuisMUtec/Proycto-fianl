# Consideraciones
Solo se registran usuarios, el jwt secret se guarda en aws systems manager parameter store




---
Esto es **importante en AWS Academy**, porque si creas roles nuevos, normalmente no tendrás permisos para asignarlos o te dará error al hacer deploy con Serverless Framework.

# ✅ Consideraciones para el backend y `serverless.yml` (versión AWS Academy con *LabRole*)

Esta es la versión corregida para que GitHub Copilot entienda que **debe usar `LabRole` como rol IAM** en todas las funciones, en Step Functions y en cualquier recurso que lo requiera.

---

## 1. Uso obligatorio del rol `LabRole` (AWS Academy)

* Todas las Lambdas deben incluir explícitamente este rol:

```yaml
role: arn:aws:iam::${aws:accountId}:role/LabRole
```

* El Step Functions State Machine debe también especificar este mismo rol utilizando:

```yaml
roleArn: arn:aws:iam::${aws:accountId}:role/LabRole
```

* No crear más roles IAM en el `serverless.yml`.
  *(La creación de roles está restringida en AWS Academy)*.

* Todas las políticas necesarias (accesso a DynamoDB, S3, Systems Manager Parameter Store, EventBridge, APIGateway) ya están preconfiguradas dentro de `LabRole`.

---

## 2. Lambdas y responsabilidades (ajustado con LabRole)

* Todas las funciones deben declarar **el mismo rol**:

```yaml
functions:
  auth:
    handler: src/auth.handler
    role: arn:aws:iam::${aws:accountId}:role/LabRole
```

* Lambdas recomendadas:

  * `auth` (login / register)
  * `productoService` (CRUD de productos)
  * `prepareOrderData` (parte del Step Functions)
  * `persistOrder`
  * `publishOrderCreatedEvent`
  * `updateStatus` (cambios de estado)
  * WebSocket handlers:

    * `onConnect`
    * `onDisconnect`
  * `orderEventsToWS` (envía mensajes a API Gateway WS)

---

## 3. Tablas DynamoDB (sin roles nuevos)

Para cada tabla en `docs/tablasDynamoDB/*.md`, la definición en serverless.yml sería algo como:

```yaml
resources:
  Resources:
    OrdersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:service}-orders-${sls:stage}
        AttributeDefinitions:
          - AttributeName: orderId
            AttributeType: S
        KeySchema:
          - AttributeName: orderId
            KeyType: HASH
        BillingMode: PAY_PER_REQUEST
```

⚠️ NOTA IMPORTANTE
No definas `"IAMRoleStatements"` dentro de `serverless.yml`, porque **AWS Academy no lo permite**.
Confiarás en que **LabRole ya tiene permisos suficientes**.

---

## 4. Seguridad y Param Store (LabRole ya tiene acceso)

* `LabRole` incluye permisos para leer parámetros del Systems Manager Parameter Store.
* Para el JWT secret:

```yaml
environment:
  JWT_SECRET: ${ssm:/project-name/jwt-secret~true}
```

* No poner permisos personalizados, LabRole ya tiene acceso.

---

## 5. Manejo de errores

Incluye esto en tu documento para que Copilot genere código consistente:

* Todos los handlers deben envolver su lógica en bloques `try/catch`.
* Los errores se devuelven en formato JSON consistente:

```json
{
  "message": "Error processing request",
  "code": "VALIDATION_ERROR",
  "details": { }
}
```

* Usar `console.error` para loguear errores con:

  * `requestId`
  * `userId`
  * `orderId`
  * `functionName`

---

## 6. API Gateway (HTTP + WS)

Incluir en `indicacionesGenerales.md`:

* Documentar **contrato de APIs**:

  * Rutas, métodos, body de entrada, ejemplo de salida, códigos de error.
* Para WebSockets:

  * Documentar los tipos de mensajes enviados a los clientes (`ORDER_CREATED`, `ORDER_STATUS_CHANGED`).
* Para cada Lambda expuesta en HTTP o WebSockets, agregar:

```yaml
role: arn:aws:iam::${aws:accountId}:role/LabRole
```

---

## 7. Step Functions (Order Workflow) usando LabRole

Ejemplo del bloque a documentar:

```yaml
stepFunctions:
  stateMachines:
    orderWorkflow:
      name: orderWorkflow-${sls:stage}
      roleArn: arn:aws:iam::${aws:accountId}:role/LabRole
      definition:
        Comment: "Order creation workflow"
        StartAt: PrepareOrderData
        States:
          PrepareOrderData:
            Type: Task
            Resource: arn:aws:lambda:${aws:region}:${aws:accountId}:function:${self:service}-prepareOrderData
            Next: PersistOrder
          PersistOrder:
            Type: Task
            Resource: arn:aws:lambda:${aws:region}:${aws:accountId}:function:${self:service}-persistOrder
            Next: PublishOrderCreatedEvent
          PublishOrderCreatedEvent:
            Type: Task
            Resource: arn:aws:lambda:${aws:region}:${aws:accountId}:function:${self:service}-publishOrderCreatedEvent
            End: true
```

---

## 8. EventBridge (misma regla → misma Lambda → LabRole)

La regla debe escuchar:

```yaml
detail-type:
  - ORDER_CREATED
  - ORDER_STATUS_CHANGED
```

y disparar **siempre** a:

```
orderEventsToWS
```

Ya no declares roles nuevos:

```yaml
role: arn:aws:iam::${aws:accountId}:role/LabRole
```

---

## 9. Stages y naming

* Mantener nombres:

  * `${self:service}-${sls:stage}-orders`
  * `${self:service}-${sls:stage}-products`
* Con esto Copilot entenderá patrones y autocompletará correctamente.

---

## ✔️ Si quieres, te genero un `serverless.yml` plantilla adaptado al 100% para AWS Academy + LabRole + tu arquitectura



# Arquitectura de solucion serverless en eraser (consulta documentacion de ser necesario)

//otros 
AWS Systems Manager Parameter Store [icon: aws-systems-manager]
S3 (imagenes) [icon: aws-simple-storage-service]
EventBridge [icon: aws-eventbridge]



//API gateway
API gateway WS [icon: aws-api-gateway]
API gateway HTTP [icon: aws-api-gateway]
API gateway HTTP \n login registro [icon: aws-api-gateway]

//tablas Dynamo
WS Connections [icon: aws-dynamodb]
users [icon: aws-dynamodb]
orders [icon: aws-dynamodb]
producto [icon: aws-dynamodb]

//Lambdas
Auth [icon: aws-lambda]
producto \n Service [icon: aws-lambda]

updateStatus [icon: aws-lambda]

Cliente [icon: laptop]
Internet [icon: browser]







Frontend [icon: aws-amplify] {
  Despachador [icon: package]
  Cocinero [icon: chef]
  Usuario [icon: user]
   
}

WebSockets [icon: websocket ]{
  onConnect [icon: aws-lambda]
  onDisconnect [icon: aws-lambda]
  orderEventsToWS [icon: aws-lambda]
  


}


OrderWorkflow [icon: aws-step-functions, color: red ] {
  
  
  PrepareOrderData [icon: aws-lambda]
  
  PublishOrderCreatedEvent [icon: aws-lambda]
  Persist&BuildOrder[icon: aws-lambda]


}
Persist&BuildOrder -> orders



  

// Frontend CON distintos api gateway
Cliente -> Internet -> 
Frontend -> API gateway WS


//WebScokets
API gateway WS -> WebSockets
onConnect -> WS Connections
onDisconnect -> WS Connections


//autenticacion login register
Frontend -> API gateway HTTP \n login registro -> Auth -> AWS Systems Manager Parameter Store

Auth -> users

//disparador de cambios de estado
EventBridge -> orderEventsToWS -> API gateway WS





//order workflow
API gateway HTTP -> OrderWorkflow
PublishOrderCreatedEvent -> EventBridge




 //getear producto de lectura 
 API gateway HTTP -> producto \n Service -> producto -> S3 (imagenes) 

Frontend -> API gateway HTTP

//Cambio de estado (via Lambda updateStatus)
API gateway HTTP -> updateStatus -> EventBridge 

 