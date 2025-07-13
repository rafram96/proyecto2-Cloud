#!/bin/bash
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR=~/logs
LOG_FILE="$LOG_DIR/api_usuarios_$TIMESTAMP.log"
mkdir -p "$LOG_DIR"

API_DIR=~/proyecto2-Cloud/backend/api-usuarios

if [ ! -d "$API_DIR" ]; then
  echo "❌ api-usuarios no encontrado en $API_DIR"
  exit 1
fi

cd "$API_DIR"

echo "🗑️ Eliminando api-usuarios..."
sls remove > "$LOG_FILE" 2>&1 || echo "⚠️ Fallo al eliminar api-usuarios (posiblemente ya no existe)"

echo "🚀 Desplegando api-usuarios..."
if sls deploy > "$LOG_FILE" 2>&1; then
  echo "✅ api-usuarios desplegado correctamente"
  echo "📋 Log guardado en: $LOG_FILE"
  
  echo -e "\n🌐 Endpoints desplegados:"
  # Buscar exactamente los 3 endpoints que se acaban de crear
  grep -E "POST.*auth/registro|POST.*auth/login|GET.*auth/validar" "$LOG_FILE" | sed 's/^[ \t]*//'
  
else
  echo "❌ Fallo al desplegar api-usuarios"
  echo "📖 Log de errores:"
  echo "----------------------------------------"
  cat "$LOG_FILE"
  echo "----------------------------------------"
  exit 1
fi
