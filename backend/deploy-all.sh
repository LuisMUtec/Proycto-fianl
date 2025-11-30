#!/bin/bash

###############################################################################
# FRIDAYS PERÚ - DEPLOYMENT SCRIPT
# Deploya todos los 7 microservicios en orden correcto
###############################################################################

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Servicios a deployar (en orden de dependencias)
SERVICES=(
  "ecommerce-service"
  "kitchen-service"
  "delivery-service"
  "admin-service"
  "websocket-service"
  "stepfunctions-service"
  "workers-service"
)

# Contadores
SUCCESS=0
FAILED=0
TOTAL=${#SERVICES[@]}
START_TIME=$(date +%s)

# Función para mostrar header
show_header() {
  echo -e "${BLUE}"
  echo "╔════════════════════════════════════════════════════════╗"
  echo "║                                                        ║"
  echo "║       FRIDAYS PERÚ - DEPLOYMENT AUTOMATIZADO          ║"
  echo "║                                                        ║"
  echo "╚════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
  echo ""
}

# Función para mostrar progreso
show_progress() {
  local current=$1
  local total=$2
  local service=$3
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}📦 [$current/$total] Deploying: $service${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

# Función para verificar pre-requisitos
check_prerequisites() {
  echo -e "${YELLOW}🔍 Verificando pre-requisitos...${NC}"
  echo ""
  
  # Verificar AWS CLI
  if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI no está instalado${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ AWS CLI instalado${NC}"
  
  # Verificar Serverless Framework (global o local)
  if command -v serverless &> /dev/null; then
    echo -e "${GREEN}✅ Serverless Framework instalado (global)${NC}"
    SLS_CMD="serverless"
  elif npx serverless --version &> /dev/null; then
    echo -e "${GREEN}✅ Serverless Framework instalado (local)${NC}"
    SLS_CMD="npx serverless"
  else
    echo -e "${RED}❌ Serverless Framework no está instalado${NC}"
    echo -e "${YELLOW}Instalar con: npm install serverless@3 --save-dev${NC}"
    exit 1
  fi
  
  # Verificar credenciales AWS
  if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ Credenciales AWS no configuradas o expiradas${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ Credenciales AWS activas${NC}"
  
  # Verificar LabRole
  if ! aws iam get-role --role-name LabRole &> /dev/null; then
    echo -e "${RED}❌ LabRole no encontrado${NC}"
    echo -e "${YELLOW}Inicia tu AWS Academy Lab${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ LabRole activo${NC}"
  
  # Verificar Parameter Store
  if ! aws ssm get-parameter --name "/fridays/jwt-secret" --with-decryption &> /dev/null; then
    echo -e "${YELLOW}⚠️  JWT secret no encontrado en Parameter Store${NC}"
    echo -e "${YELLOW}Creando secret...${NC}"
    aws ssm put-parameter \
      --name "/fridays/jwt-secret" \
      --value "fridays-secret-$(date +%s)" \
      --type "SecureString" \
      --region us-east-1 > /dev/null
    echo -e "${GREEN}✅ JWT secret creado${NC}"
  else
    echo -e "${GREEN}✅ Parameter Store configurado${NC}"
  fi
  
  echo ""
}

# Función para deployar un servicio
deploy_service() {
  local service=$1
  local index=$2
  
  show_progress $index $TOTAL $service
  
  # Ir al directorio del servicio
  cd "services/$service" || {
    echo -e "${RED}❌ No se pudo acceder a services/$service${NC}"
    FAILED=$((FAILED + 1))
    cd ../..
    return 1
  }
  
  # Verificar que exista serverless.yml
  if [ ! -f "serverless.yml" ]; then
    echo -e "${RED}❌ No se encontró serverless.yml en $service${NC}"
    FAILED=$((FAILED + 1))
    cd ../..
    return 1
  fi
  
  # Instalar dependencias si no existen
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
    npm install --silent
  fi
  
  # Hacer deployment
  echo -e "${BLUE}🚀 Ejecutando deployment...${NC}"
  if $SLS_CMD deploy --stage dev 2>&1 | tee "/tmp/deploy-${service}.log"; then
    echo ""
    echo -e "${GREEN}✅ $service deployado exitosamente!${NC}"
    SUCCESS=$((SUCCESS + 1))
    
    # Guardar endpoints
    echo "=== ENDPOINTS DE $service ===" >> ../../deployed-endpoints.txt
    grep -A 20 "endpoints:" "/tmp/deploy-${service}.log" | head -20 >> ../../deployed-endpoints.txt
    echo "" >> ../../deployed-endpoints.txt
    
    cd ../..
    return 0
  else
    echo ""
    echo -e "${RED}❌ Error al deployar $service${NC}"
    echo -e "${YELLOW}Ver logs en: /tmp/deploy-${service}.log${NC}"
    FAILED=$((FAILED + 1))
    cd ../..
    return 1
  fi
}

# Función para mostrar resumen
show_summary() {
  local end_time=$(date +%s)
  local duration=$((end_time - START_TIME))
  local minutes=$((duration / 60))
  local seconds=$((duration % 60))
  
  echo ""
  echo -e "${BLUE}"
  echo "╔════════════════════════════════════════════════════════╗"
  echo "║              DEPLOYMENT SUMMARY                        ║"
  echo "╚════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
  echo ""
  echo -e "📊 ${GREEN}Exitosos:${NC} $SUCCESS/$TOTAL"
  
  if [ $FAILED -gt 0 ]; then
    echo -e "📊 ${RED}Fallidos:${NC} $FAILED/$TOTAL"
  fi
  
  echo -e "⏱️  Tiempo total: ${minutes}m ${seconds}s"
  echo ""
  
  if [ -f "deployed-endpoints.txt" ]; then
    echo -e "${BLUE}📝 Endpoints guardados en: deployed-endpoints.txt${NC}"
    echo ""
  fi
  
  if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                                                        ║"
    echo "║   🎉 ¡DEPLOYMENT COMPLETO Y EXITOSO!                  ║"
    echo "║                                                        ║"
    echo "║   Todos los 7 servicios están deployados en AWS       ║"
    echo "║                                                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${BLUE}🚀 Próximos pasos:${NC}"
    echo "  1. Revisa los endpoints en deployed-endpoints.txt"
    echo "  2. Configura el frontend con las URLs"
    echo "  3. Crea las tablas DynamoDB (scripts/create-tables-aws.js)"
    echo "  4. Testea los endpoints"
    echo ""
    return 0
  else
    echo -e "${RED}"
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                                                        ║"
    echo "║   ⚠️  ALGUNOS DEPLOYMENTS FALLARON                    ║"
    echo "║                                                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${YELLOW}Revisa los logs en /tmp/deploy-*.log${NC}"
    echo ""
    return 1
  fi
}

###############################################################################
# MAIN
###############################################################################

# Limpiar pantalla
clear

# Mostrar header
show_header

# Verificar pre-requisitos
check_prerequisites

# Confirmar deployment
echo -e "${YELLOW}⚠️  Vas a deployar 7 servicios en AWS${NC}"
echo -e "${YELLOW}   Esto puede tomar 20-30 minutos${NC}"
echo ""
read -p "¿Continuar? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${RED}Deployment cancelado${NC}"
  exit 0
fi

# Limpiar archivo de endpoints previo
> deployed-endpoints.txt

# Deployar cada servicio
for i in "${!SERVICES[@]}"; do
  INDEX=$((i + 1))
  SERVICE="${SERVICES[$i]}"
  
  deploy_service "$SERVICE" "$INDEX"
  
  # Pequeña pausa entre deployments para evitar rate limits
  if [ $INDEX -lt $TOTAL ]; then
    echo ""
    echo -e "${YELLOW}⏳ Esperando 8 segundos antes del siguiente deployment...${NC}"
    sleep 8
    echo ""
  fi
done

# Mostrar resumen final
show_summary

# Exit code basado en éxito/fallo
if [ $FAILED -eq 0 ]; then
  exit 0
else
  exit 1
fi
