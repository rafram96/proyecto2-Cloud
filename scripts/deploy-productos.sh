#!/bin/bash
set -e

TIMESTAMP=$1
LOG_DIR=~/logs
echo "🚀 Desplegando api-productos..." | tee -a "$LOG_FILE"

# Crear archivo temporal para capturar solo el output del deploy actual
DEPLOY_OUTPUT=$(mktemp)

if sls deploy > "$DEPLOY_OUTPUT" 2>&1; then
  # Añadir output del deploy al log principal
  cat "$DEPLOY_OUTPUT" >> "$LOG_FILE"
  
  echo "✅ api-productos desplegado correctamente" | tee -a "$LOG_FILE"

  echo -e "\n🌐 Endpoints de api-productos:"
  # Extraer endpoints solo del deploy actual
  grep -E "https://.*\.amazonaws\.com" "$DEPLOY_OUTPUT" | sort -u
  
  # Limpiar archivo temporal
  rm -f "$DEPLOY_OUTPUT"
else
  # Si falla, mostrar el error y añadir al log
  cat "$DEPLOY_OUTPUT" >> "$LOG_FILE"
  echo "❌ Fallo al desplegar api-productos, revisa el log $LOG_FILE" | tee -a "$LOG_FILE"
  rm -f "$DEPLOY_OUTPUT"
  exit 1
fi$LOG_DIR/api_productos_$TIMESTAMP.log"
mkdir -p "$LOG_DIR"

API_DIR=~/proyecto2-Cloud/backend/api-productos

if [ ! -d "$API_DIR" ]; then
  echo "❌ api-productos no encontrado en $API_DIR"
  exit 1
fi

cd "$API_DIR"

echo "🗑️ Eliminando api-productos..." | tee -a "$LOG_FILE"
sls remove >> "$LOG_FILE" 2>&1 || echo "⚠️ Fallo al eliminar api-productos (posiblemente ya no existe)" | tee -a "$LOG_FILE"

echo "� Verificando y reinstalando dependencias del layer..." | tee -a "$LOG_FILE"
LAYER_DIR="$API_DIR/layers/dependencies/nodejs"

if [ -d "$LAYER_DIR" ]; then
  cd "$LAYER_DIR"
  
  echo "📦 Verificando si jsonwebtoken existe..." | tee -a "$LOG_FILE"
  if [ ! -d "node_modules/jsonwebtoken" ]; then
    echo "❌ jsonwebtoken no encontrado, reinstalando dependencias..." | tee -a "$LOG_FILE"
    rm -rf node_modules package-lock.json 2>/dev/null || true
    npm install --production >> "$LOG_FILE" 2>&1
  else
    echo "✅ jsonwebtoken encontrado" | tee -a "$LOG_FILE"
  fi
  
  echo "🔍 Verificando instalación de jsonwebtoken..." | tee -a "$LOG_FILE"
  if [ -d "node_modules/jsonwebtoken" ]; then
    echo "✅ jsonwebtoken correctamente instalado" | tee -a "$LOG_FILE"
  else
    echo "❌ Error: jsonwebtoken no se pudo instalar" | tee -a "$LOG_FILE"
    exit 1
  fi
  
  cd "$API_DIR"
else
  echo "⚠️ Directorio del layer no encontrado: $LAYER_DIR" | tee -a "$LOG_FILE"
fi

echo "�🚀 Desplegando api-productos..." | tee -a "$LOG_FILE"
if sls deploy >> "$LOG_FILE" 2>&1; then
  echo "✅ api-productos desplegado correctamente" | tee -a "$LOG_FILE"

  echo -e "\n🌐 Endpoints de api-productos:"
  grep -E "https://.*\.amazonaws\.com" "$LOG_FILE"
else
  echo "❌ Fallo al desplegar api-productos, revisa el log $LOG_FILE" | tee -a "$LOG_FILE"
  exit 1
fi
