#!/bin/bash

# Script para desplegar la API de productos con las mejoras de CORS

echo "🚀 Desplegando API de Productos..."

# Navegar al directorio de la API
cd backend/api-productos

# Verificar que existe el archivo serverless.yml
if [ ! -f "serverless.yml" ]; then
    echo "❌ Error: No se encontró serverless.yml en el directorio actual"
    exit 1
fi

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Instalar serverless globalmente si no está instalado
if ! command -v serverless &> /dev/null; then
    echo "📦 Instalando Serverless Framework..."
    npm install -g serverless
fi

# Desplegar
echo "🔄 Desplegando servicios..."
serverless deploy --stage dev --verbose

# Verificar si el despliegue fue exitoso
if [ $? -eq 0 ]; then
    echo "✅ Despliegue exitoso!"
    echo ""
    echo "📋 Endpoints desplegados:"
    echo "   POST - /productos/crear"
    echo "   POST - /productos/listar" 
    echo "   POST - /productos/buscar"
    echo "   POST - /productos/actualizar"
    echo "   POST - /productos/eliminar"
    echo "   POST - /productos/upload-image"
    echo ""
    echo "🔧 Recursos creados:"
    echo "   - Tabla DynamoDB: p_productos-dev"
    echo "   - Bucket S3: imagenes-productos-dev"
    echo "   - Funciones Lambda con CORS habilitado"
    echo ""
    echo "📝 Recuerda:"
    echo "   - Actualizar VITE_API_BASE_URL en el frontend"
    echo "   - Configurar las credenciales AWS si es necesario"
else
    echo "❌ Error en el despliegue"
    exit 1
fi
