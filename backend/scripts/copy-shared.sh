#!/bin/bash
# Script para copiar la carpeta shared a cada servicio antes del deploy

echo "📦 Copiando shared modules a todos los servicios..."
echo ""

SERVICES=(
  "services/ecommerce-service"
  "services/kitchen-service"
  "services/delivery-service"
  "services/admin-service"
  "services/websocket-service"
  "services/stepfunctions-service"
  "services/workers-service"
)

for service in "${SERVICES[@]}"; do
  echo "   → Copiando a $service"
  
  # Eliminar carpeta shared existente si existe
  rm -rf "$service/shared"
  
  # Copiar carpeta shared
  cp -r shared "$service/shared"
  
  if [ $? -eq 0 ]; then
    echo "      ✅ Copiado correctamente"
  else
    echo "      ❌ Error al copiar"
  fi
done

echo ""
echo "✅ Shared modules copiados a todos los servicios!"
