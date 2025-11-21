#!/bin/bash

# Script de prueba para los endpoints del backend
# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="https://l248av92o1.execute-api.us-east-1.amazonaws.com/dev"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   PRUEBAS DE ENDPOINTS - FRIDAYS PERÚ${NC}"
echo -e "${BLUE}========================================${NC}\n"

# 1. Probar endpoint de productos (sin auth)
echo -e "${YELLOW}1. Listando todos los productos del menú...${NC}"
curl -s "$BASE_URL/menu" | jq '.'
echo -e "\n"

# 2. Registrar un nuevo cliente
echo -e "${YELLOW}2. Registrando nuevo cliente...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test_'$(date +%s)'@example.com",
    "password": "password123",
    "phone": "987654321"
  }')
echo $REGISTER_RESPONSE | jq '.'

# Extraer email del registro
EMAIL=$(echo $REGISTER_RESPONSE | jq -r '.user.email')
echo -e "${GREEN}✓ Cliente registrado: $EMAIL${NC}\n"

# 3. Login
echo -e "${YELLOW}3. Haciendo login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"password123\"
  }")
echo $LOGIN_RESPONSE | jq '.'

# Extraer token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo -e "${GREEN}✓ Token obtenido: ${TOKEN:0:50}...${NC}\n"

# 4. Agregar productos al carrito
echo -e "${YELLOW}4. Agregando productos al carrito...${NC}"
curl -s -X POST "$BASE_URL/cart/add" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": "prod-001",
    "quantity": 2
  }' | jq '.'
echo -e "${GREEN}✓ Producto agregado${NC}\n"

# 5. Ver carrito
echo -e "${YELLOW}5. Consultando carrito...${NC}"
curl -s "$BASE_URL/cart" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo -e "\n"

# 6. Hacer checkout
echo -e "${YELLOW}6. Realizando checkout...${NC}"
ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sedeId": "sede-001",
    "deliveryAddress": "Av. Test 123, Lima",
    "paymentMethod": "efectivo"
  }')
echo $ORDER_RESPONSE | jq '.'

ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.order.orderId')
echo -e "${GREEN}✓ Orden creada: $ORDER_ID${NC}\n"

# 7. Ver órdenes del usuario
echo -e "${YELLOW}7. Consultando mis órdenes...${NC}"
curl -s "$BASE_URL/users/orders" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo -e "\n"

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Pruebas completadas exitosamente${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "\nToken guardado para uso posterior:"
echo -e "${GREEN}$TOKEN${NC}\n"
