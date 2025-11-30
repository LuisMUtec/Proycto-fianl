#!/bin/bash

###############################################################################
# FRIDAYS PERÚ - GET ALL ENDPOINTS
# Obtiene todos los endpoints de los servicios deployados
###############################################################################

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Archivo de salida
OUTPUT_FILE="endpoints.txt"
JSON_OUTPUT="endpoints.json"

# Limpiar archivos anteriores
> "$OUTPUT_FILE"
> "$JSON_OUTPUT"

# Header
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║       FRIDAYS PERÚ - ENDPOINTS DEPLOYADOS             ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Array de servicios
SERVICES=(
  "ecommerce-service"
  "kitchen-service"
  "delivery-service"
  "admin-service"
  "websocket-service"
  "stepfunctions-service"
  "workers-service"
)

# Iniciar JSON
echo "{" > "$JSON_OUTPUT"
echo "  \"services\": {" >> "$JSON_OUTPUT"

# Contador
TOTAL=${#SERVICES[@]}
CURRENT=0

# Función para obtener endpoints de un servicio
get_service_endpoints() {
  local service=$1
  CURRENT=$((CURRENT + 1))
  
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}📦 [$CURRENT/$TOTAL] $service${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  cd "services/$service" || {
    echo -e "${YELLOW}⚠️  Servicio no encontrado: $service${NC}"
    echo ""
    cd ../..
    return 1
  }
  
  # Obtener info del servicio
  if npx serverless info --stage dev > /tmp/sls-info-${service}.txt 2>&1; then
    echo -e "${GREEN}✅ Servicio deployado${NC}"
    echo ""
    
    # Guardar en archivo de texto
    echo "════════════════════════════════════════════════════════" >> ../../"$OUTPUT_FILE"
    echo "SERVICE: $service" >> ../../"$OUTPUT_FILE"
    echo "════════════════════════════════════════════════════════" >> ../../"$OUTPUT_FILE"
    cat /tmp/sls-info-${service}.txt >> ../../"$OUTPUT_FILE"
    echo "" >> ../../"$OUTPUT_FILE"
    echo "" >> ../../"$OUTPUT_FILE"
    
    # Extraer base URL
    BASE_URL=$(grep -o 'https://[a-z0-9]*.execute-api.[a-z0-9-]*.amazonaws.com/[a-z]*' /tmp/sls-info-${service}.txt | head -1)
    WS_URL=$(grep -o 'wss://[a-z0-9]*.execute-api.[a-z0-9-]*.amazonaws.com/[a-z]*' /tmp/sls-info-${service}.txt | head -1)
    
    if [ -n "$BASE_URL" ]; then
      echo -e "${GREEN}🌐 Base URL:${NC} $BASE_URL"
    fi
    
    if [ -n "$WS_URL" ]; then
      echo -e "${GREEN}🔌 WebSocket URL:${NC} $WS_URL"
    fi
    
    # Extraer endpoints
    echo -e "${YELLOW}📍 Endpoints:${NC}"
    grep -E '(GET|POST|PUT|DELETE|PATCH) - https://' /tmp/sls-info-${service}.txt | while read line; do
      echo "   $line"
    done
    
    # Agregar a JSON
    if [ $CURRENT -gt 1 ]; then
      echo "," >> ../../"$JSON_OUTPUT"
    fi
    
    echo "    \"$service\": {" >> ../../"$JSON_OUTPUT"
    
    if [ -n "$BASE_URL" ]; then
      echo "      \"baseUrl\": \"$BASE_URL\"," >> ../../"$JSON_OUTPUT"
    fi
    
    if [ -n "$WS_URL" ]; then
      echo "      \"wsUrl\": \"$WS_URL\"," >> ../../"$JSON_OUTPUT"
    fi
    
    echo "      \"endpoints\": [" >> ../../"$JSON_OUTPUT"
    
    # Extraer endpoints en formato JSON
    local first=true
    grep -E '(GET|POST|PUT|DELETE|PATCH) - https://' /tmp/sls-info-${service}.txt | while read method dash url; do
      if [ "$first" = false ]; then
        echo "," >> ../../"$JSON_OUTPUT"
      fi
      echo "        {" >> ../../"$JSON_OUTPUT"
      echo "          \"method\": \"$method\"," >> ../../"$JSON_OUTPUT"
      echo "          \"url\": \"$url\"" >> ../../"$JSON_OUTPUT"
      echo -n "        }" >> ../../"$JSON_OUTPUT"
      first=false
    done
    
    echo "" >> ../../"$JSON_OUTPUT"
    echo "      ]" >> ../../"$JSON_OUTPUT"
    echo -n "    }" >> ../../"$JSON_OUTPUT"
    
  else
    echo -e "${YELLOW}⚠️  Servicio no deployado o error al obtener info${NC}"
    cat /tmp/sls-info-${service}.txt
  fi
  
  echo ""
  cd ../..
}

# Procesar cada servicio
for service in "${SERVICES[@]}"; do
  get_service_endpoints "$service"
done

# Cerrar JSON
echo "" >> "$JSON_OUTPUT"
echo "  }" >> "$JSON_OUTPUT"
echo "}" >> "$JSON_OUTPUT"

# Resumen final
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║                    RESUMEN                             ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${GREEN}📄 Endpoints guardados en:${NC}"
echo "   - $OUTPUT_FILE (formato texto)"
echo "   - $JSON_OUTPUT (formato JSON)"
echo ""
echo -e "${BLUE}Para ver los endpoints:${NC}"
echo "   cat $OUTPUT_FILE"
echo ""
echo -e "${BLUE}Para usar en Postman:${NC}"
echo "   1. Importa las colecciones de postman/"
echo "   2. Actualiza las variables con las URLs de $OUTPUT_FILE"
echo ""

# Crear resumen compacto
echo -e "${YELLOW}📋 Resumen Rápido:${NC}"
echo ""

for service in "${SERVICES[@]}"; do
  if [ -f "/tmp/sls-info-${service}.txt" ]; then
    BASE_URL=$(grep -o 'https://[a-z0-9]*.execute-api.[a-z0-9-]*.amazonaws.com/[a-z]*' /tmp/sls-info-${service}.txt | head -1)
    WS_URL=$(grep -o 'wss://[a-z0-9]*.execute-api.[a-z0-9-]*.amazonaws.com/[a-z]*' /tmp/sls-info-${service}.txt | head -1)
    
    if [ -n "$BASE_URL" ]; then
      echo -e "${GREEN}✅ $service:${NC}"
      echo "   $BASE_URL"
    elif [ -n "$WS_URL" ]; then
      echo -e "${GREEN}✅ $service:${NC}"
      echo "   $WS_URL"
    else
      echo -e "${YELLOW}⚠️  $service: No deployado${NC}"
    fi
  fi
done

echo ""
echo -e "${GREEN}✅ Proceso completado!${NC}"
