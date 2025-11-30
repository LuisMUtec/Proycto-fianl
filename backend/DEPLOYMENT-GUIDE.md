# 🚀 GUÍA COMPLETA DE DEPLOYMENT

**Fecha:** 29 de noviembre de 2025  
**Proyecto:** Fridays Perú Backend  
**Servicios:** 7 microservicios

---

## ⚠️ IMPORTANTE: DEBES DEPLOYAR TODOS LOS SERVICIOS

El proyecto tiene **7 microservicios independientes** y cada uno necesita su propio deployment:

```
1. ✅ ecommerce-service
2. ✅ kitchen-service
3. ✅ delivery-service
4. ✅ admin-service
5. ✅ websocket-service
6. ✅ stepfunctions-service
7. ✅ workers-service
```

---

## 📋 PRE-REQUISITOS

Antes de hacer deployment, verifica:

### 1. AWS Credentials
```bash
# Verificar que tienes credenciales activas
aws sts get-caller-identity

# Deberías ver:
# {
#   "UserId": "...",
#   "Account": "139051438271",
#   "Arn": "arn:aws:sts::139051438271:assumed-role/voclabs/..."
# }
```

### 2. LabRole Activo
```bash
# Verificar que LabRole existe
aws iam get-role --role-name LabRole

# Si falla, necesitas iniciar AWS Academy Lab
```

### 3. Parameter Store
```bash
# Crear JWT secret
aws ssm put-parameter \
  --name "/fridays/jwt-secret" \
  --value "tu-secret-super-seguro-aqui-$(date +%s)" \
  --type "SecureString" \
  --region us-east-1

# Verificar
aws ssm get-parameter \
  --name "/fridays/jwt-secret" \
  --with-decryption \
  --region us-east-1
```

### 4. Dependencias Instaladas
```bash
# Instalar en cada servicio
cd services/ecommerce-service && npm install
cd ../kitchen-service && npm install
cd ../delivery-service && npm install
cd ../admin-service && npm install
cd ../websocket-service && npm install
cd ../stepfunctions-service && npm install
cd ../workers-service && npm install
```

---

## 🔢 ORDEN DE DEPLOYMENT (IMPORTANTE)

**Debes deployar en este orden** para evitar errores de dependencias:

### Orden Recomendado:

```
1. ecommerce-service     (contiene auth y orders base)
2. kitchen-service       (depende de orders)
3. delivery-service      (depende de orders)
4. admin-service         (independiente)
5. websocket-service     (para notificaciones)
6. stepfunctions-service (orquestación de orders)
7. workers-service       (procesa cola SQS)
```

---

## 📝 COMANDOS DE DEPLOYMENT

### Método 1: Deployment Uno por Uno (Recomendado)

```bash
# Ir a la raíz del proyecto
cd /home/nayeliguerrero/Descargas/VSCODE\ projects/Proycto-fianl/backend

# 1. E-COMMERCE SERVICE
echo "🚀 Deploying E-COMMERCE SERVICE..."
cd services/ecommerce-service
serverless deploy --stage dev --verbose
cd ../..

# 2. KITCHEN SERVICE
echo "🚀 Deploying KITCHEN SERVICE..."
cd services/kitchen-service
serverless deploy --stage dev --verbose
cd ../..

# 3. DELIVERY SERVICE
echo "🚀 Deploying DELIVERY SERVICE..."
cd services/delivery-service
serverless deploy --stage dev --verbose
cd ../..

# 4. ADMIN SERVICE
echo "🚀 Deploying ADMIN SERVICE..."
cd services/admin-service
serverless deploy --stage dev --verbose
cd ../..

# 5. WEBSOCKET SERVICE
echo "🚀 Deploying WEBSOCKET SERVICE..."
cd services/websocket-service
serverless deploy --stage dev --verbose
cd ../..

# 6. STEP FUNCTIONS SERVICE
echo "🚀 Deploying STEP FUNCTIONS SERVICE..."
cd services/stepfunctions-service
serverless deploy --stage dev --verbose
cd ../..

# 7. WORKERS SERVICE
echo "🚀 Deploying WORKERS SERVICE..."
cd services/workers-service
serverless deploy --stage dev --verbose
cd ../..

echo "✅ TODOS LOS SERVICIOS DEPLOYADOS!"
```

### Método 2: Script Automatizado

Crea un archivo `deploy-all.sh`:

```bash
#!/bin/bash

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Servicios a deployar
SERVICES=(
  "ecommerce-service"
  "kitchen-service"
  "delivery-service"
  "admin-service"
  "websocket-service"
  "stepfunctions-service"
  "workers-service"
)

# Contador
SUCCESS=0
FAILED=0

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Deployment de Fridays Perú Backend   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Deployar cada servicio
for SERVICE in "${SERVICES[@]}"; do
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}🚀 Deploying: $SERVICE${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  cd "services/$SERVICE" || exit
  
  if serverless deploy --stage dev; then
    echo -e "${GREEN}✅ $SERVICE deployed successfully!${NC}"
    SUCCESS=$((SUCCESS + 1))
  else
    echo -e "${RED}❌ $SERVICE deployment failed!${NC}"
    FAILED=$((FAILED + 1))
  fi
  
  cd ../..
  echo ""
done

# Resumen
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         DEPLOYMENT SUMMARY             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo -e "${GREEN}✅ Successful: $SUCCESS/${#SERVICES[@]}${NC}"
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}❌ Failed: $FAILED/${#SERVICES[@]}${NC}"
fi
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 ALL SERVICES DEPLOYED SUCCESSFULLY!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  Some deployments failed. Check logs above.${NC}"
  exit 1
fi
```

**Usar el script:**

```bash
# Dar permisos de ejecución
chmod +x deploy-all.sh

# Ejecutar
./deploy-all.sh
```

---

## 📊 TIEMPO ESTIMADO DE DEPLOYMENT

| Servicio | Lambdas | Tiempo Aprox |
|----------|---------|--------------|
| E-COMMERCE | 35 | ~5-7 min |
| KITCHEN | 16 | ~3-4 min |
| DELIVERY | 14 | ~3-4 min |
| ADMIN | 17 | ~3-4 min |
| WEBSOCKET | 8 | ~2-3 min |
| STEP FUNCTIONS | 3 | ~2 min |
| WORKERS | 1 | ~1 min |
| **TOTAL** | **94** | **~20-30 min** |

---

## ✅ VERIFICACIÓN POST-DEPLOYMENT

Después de cada deployment, verifica:

### 1. Ver Endpoints Generados

```bash
# Cada deployment mostrará algo como:
endpoints:
  POST - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/auth/register
  POST - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/auth/login
  GET - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/menu
  ...

# GUARDA ESTAS URLs! Las necesitarás para el frontend
```

### 2. Verificar Lambdas en AWS Console

```bash
# Listar lambdas deployadas
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `fridays-`) == `true`].FunctionName' --output table
```

### 3. Verificar API Gateway

```bash
# Listar APIs
aws apigateway get-rest-apis --query 'items[?name==`dev-fridays-ecommerce`]'
```

### 4. Test Rápido de Endpoints

```bash
# Test endpoint público (no requiere auth)
curl https://[tu-api-id].execute-api.us-east-1.amazonaws.com/dev/menu

# Debería responder con lista de productos o []
```

---

## 🔧 TROUBLESHOOTING

### Error: "User is not authorized to perform: iam:CreateRole"

**Solución:** Estás usando LabRole, no deberías crear roles. Verifica que tu `serverless.yml` tiene:

```yaml
iam:
  role: arn:aws:iam::139051438271:role/LabRole
```

### Error: "Rate exceeded"

**Solución:** AWS Academy tiene rate limits. Espera 1-2 minutos entre deployments.

```bash
# Hacer deployment más lento
serverless deploy --stage dev
sleep 120  # Esperar 2 minutos
```

### Error: "The security token included in the request is expired"

**Solución:** Tus credenciales de AWS Academy expiraron.

```bash
# 1. Ve a AWS Academy
# 2. Click en "AWS Details"
# 3. Copia nuevas credenciales
# 4. Actualiza ~/.aws/credentials
```

### Error: "Stack already exists"

**Solución:** Ya deployaste antes. Para actualizar:

```bash
serverless deploy --stage dev --force
```

---

## 📝 GUARDAR URLS DE ENDPOINTS

Después de cada deployment, copia las URLs:

```bash
# Crear archivo con endpoints
cat > endpoints.txt << EOF
# FRIDAYS PERÚ - ENDPOINTS

## E-COMMERCE
API_ECOMMERCE=https://[id].execute-api.us-east-1.amazonaws.com/dev

## KITCHEN
API_KITCHEN=https://[id].execute-api.us-east-1.amazonaws.com/dev

## DELIVERY
API_DELIVERY=https://[id].execute-api.us-east-1.amazonaws.com/dev

## ADMIN
API_ADMIN=https://[id].execute-api.us-east-1.amazonaws.com/dev

## WEBSOCKET
WS_URL=wss://[id].execute-api.us-east-1.amazonaws.com/dev
EOF

# Usar en frontend
export REACT_APP_API_URL=https://[id].execute-api.us-east-1.amazonaws.com/dev
```

---

## 🎯 DEPLOYMENT COMPLETO - CHECKLIST

- [ ] AWS Academy Lab activo
- [ ] Credenciales configuradas
- [ ] LabRole verificado
- [ ] Parameter Store configurado (`/fridays/jwt-secret`)
- [ ] Dependencias instaladas en cada servicio
- [ ] **Deploy e-commerce-service** ✅
- [ ] **Deploy kitchen-service** ✅
- [ ] **Deploy delivery-service** ✅
- [ ] **Deploy admin-service** ✅
- [ ] **Deploy websocket-service** ✅
- [ ] **Deploy stepfunctions-service** ✅
- [ ] **Deploy workers-service** ✅
- [ ] URLs de endpoints guardadas
- [ ] Test de endpoints básicos
- [ ] Frontend configurado con URLs

---

## 🚀 COMANDOS RÁPIDOS

```bash
# Deployment completo (uno por uno)
cd services/ecommerce-service && serverless deploy --stage dev && \
cd ../kitchen-service && serverless deploy --stage dev && \
cd ../delivery-service && serverless deploy --stage dev && \
cd ../admin-service && serverless deploy --stage dev && \
cd ../websocket-service && serverless deploy --stage dev && \
cd ../stepfunctions-service && serverless deploy --stage dev && \
cd ../workers-service && serverless deploy --stage dev && \
cd ../.. && echo "✅ DEPLOYMENT COMPLETO!"
```

---

## 📚 RECURSOS

- `DEPLOYMENT-READY.md` - Guía de deployment
- `AWS-SETUP.md` - Configuración AWS
- `README.md` - Resumen del proyecto
- `ARCHITECTURE-AUDIT.md` - Arquitectura

---

## ✅ RESULTADO ESPERADO

Al finalizar todos los deployments, deberías tener:

```
✅ 7 CloudFormation Stacks creados
✅ 94 Lambda Functions deployadas
✅ 7 API Gateways configurados
✅ 1 WebSocket API
✅ 7 DynamoDB Tables
✅ 1 Step Functions State Machine
✅ 1 SQS Queue
✅ 1 SNS Topic
✅ CloudWatch Logs activos
```

---

**¡RECUERDA: DEBES DEPLOYAR LOS 7 SERVICIOS!** 🚀
