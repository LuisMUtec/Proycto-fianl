#!/bin/bash

# Script para actualizar credenciales de AWS Academy
# Ejecutar cada 4 horas cuando las credenciales expiren

echo "🔐 AWS Academy Credentials Updater"
echo "===================================="
echo ""
echo "⚠️  IMPORTANTE: Copia las credenciales desde AWS Academy:"
echo "   1. Ir a Learner Lab"
echo "   2. Click en 'AWS Details'"
echo "   3. Click en 'Show' en AWS CLI credentials"
echo "   4. Copiar TODAS las líneas (aws_access_key_id, aws_secret_access_key, aws_session_token)"
echo ""
echo "� NOTA: AWS Academy te da las credenciales como [default]"
echo "   Este script las guardará automáticamente como [fridays-dev]"
echo ""
echo "�📋 Pega las credenciales debajo (incluye la línea [default] si quieres)"
echo "   Presiona Ctrl+D cuando termines:"
echo ""

# Crear backup del archivo de credenciales
if [ -f ~/.aws/credentials ]; then
    cp ~/.aws/credentials ~/.aws/credentials.backup
    echo "✅ Backup creado: ~/.aws/credentials.backup"
fi

# Leer las credenciales del usuario en un archivo temporal
temp_file=$(mktemp)
cat > "$temp_file"

# Reemplazar [default] por [fridays-dev] si existe
sed 's/\[default\]/[fridays-dev]/g' "$temp_file" > ~/.aws/credentials

# Si no había [default], agregar [fridays-dev] al principio
if ! grep -q "\[fridays-dev\]" ~/.aws/credentials; then
    echo "[fridays-dev]" > ~/.aws/credentials
    cat "$temp_file" >> ~/.aws/credentials
fi

# Limpiar archivo temporal
rm "$temp_file"

echo ""
echo "✅ Credenciales actualizadas!"
echo ""
echo "🧪 Verificando conexión..."
aws sts get-caller-identity --profile fridays-dev

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ¡Credenciales válidas!"
    echo "📦 Ahora puedes hacer deploy:"
    echo "   npm run deploy:delivery"
    echo "   npm run deploy:admin"
else
    echo ""
    echo "❌ Error: Las credenciales no funcionan"
    echo "   Intenta copiarlas de nuevo desde AWS Academy"
fi
