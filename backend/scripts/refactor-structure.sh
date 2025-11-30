#!/bin/bash

###############################################################################
# FRIDAYS PERÚ - SCRIPT DE REFACTORIZACIÓN COMPLETA
# 
# ⚠️ SEGURIDAD:
# - NO incluye credenciales
# - Compatible con AWS Academy
# - Usa IAM Roles y Parameter Store
# 
# Este script genera la estructura completa refactorizada del proyecto
###############################################################################

echo "🚀 Iniciando refactorización completa de Fridays Perú..."
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_DIR="/home/nayeliguerrero/Descargas/VSCODE projects/Proycto-fianl/backend"

cd "$BASE_DIR"

echo -e "${BLUE}📦 Paso 1: Creando estructura de carpetas...${NC}"

# E-COMMERCE SERVICE
mkdir -p services/ecommerce-service/functions/auth
mkdir -p services/ecommerce-service/functions/menu
mkdir -p services/ecommerce-service/functions/orders
mkdir -p services/ecommerce-service/functions/cart
mkdir -p services/ecommerce-service/functions/payments
mkdir -p services/ecommerce-service/functions/products-admin

# KITCHEN SERVICE  
mkdir -p services/kitchen-service/functions/orders
mkdir -p services/kitchen-service/functions/chefs

# DELIVERY SERVICE
mkdir -p services/delivery-service/functions/drivers
mkdir -p services/delivery-service/functions/orders
mkdir -p services/delivery-service/functions/tracking

# ADMIN SERVICE
mkdir -p services/admin-service/functions/dashboard
mkdir -p services/admin-service/functions/sedes
mkdir -p services/admin-service/functions/users

# WEBSOCKET SERVICE
mkdir -p services/websocket-service/functions/connection
mkdir -p services/websocket-service/functions/events

# STEP FUNCTIONS
mkdir -p services/stepfunctions-service/functions/order-workflow
mkdir -p services/stepfunctions-service/state-machines

# WORKERS
mkdir -p services/workers-service/functions/sqs-workers
mkdir -p services/workers-service/functions/event-handlers

echo -e "${GREEN}✅ Estructura de carpetas creada${NC}"
echo ""

echo -e "${YELLOW}📝 Refactorización completada parcialmente${NC}"
echo ""
echo "Los siguientes servicios han sido refactorizados:"
echo "  ✅ Módulos compartidos (shared)"
echo "  ✅ AUTH service (register, login, refresh-token, logout)"
echo ""
echo "Para completar el refactor, continúa con:"
echo "  - E-COMMERCE service (menu, orders, cart, payments)"
echo "  - KITCHEN service"
echo "  - DELIVERY service"
echo "  - ADMIN service"
echo "  - WEBSOCKET service"
echo "  - Step Functions"
echo "  - Workers & Event Handlers"
echo "  - serverless.yml de cada servicio"
echo ""
echo "🎯 Siguiente paso: Ejecutar el script de generación de lambdas"
