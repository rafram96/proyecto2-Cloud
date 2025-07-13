#!/bin/bash
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR=~/logs
LOG_FILE="$LOG_DIR/api_compras_$TIMESTAMP.log"
mkdir -p "$LOG_DIR"

API_DIR=~/proyecto2-Cloud/backend/api-compras

if [ ! -d "$API_DIR" ]; then
  echo "❌ api-compras no encontrado en $API_DIR"
  exit 1
fi

cd "$API_DIR"
echo "🗑️ Eliminando api-compras..." | tee -a "$LOG_FILE"
sls remove >> "$LOG_FILE" 2>&1 || echo "⚠️ Fallo al eliminar api-compras (posiblemente ya no existe)" | tee -a "$LOG_FILE"

echo "🚀 Desplegando api-compras..." | tee -a "$LOG_FILE"
DEPLOY_OUTPUT=$(mktemp)

if sls deploy > "$DEPLOY_OUTPUT" 2>&1; then
  cat "$DEPLOY_OUTPUT" >> "$LOG_FILE"
  echo "✅ api-compras desplegado correctamente" | tee -a "$LOG_FILE"
  echo "📋 Log guardado en: $LOG_FILE"
  echo -e "\n🌐 Endpoints de api-compras:"
  grep -E "https://.*\.amazonaws\.com" "$DEPLOY_OUTPUT" | sort -u
  rm -f "$DEPLOY_OUTPUT"
else
  cat "$DEPLOY_OUTPUT" >> "$LOG_FILE"
  echo "❌ Fallo al desplegar api-compras, revisa el log $LOG_FILE" | tee -a "$LOG_FILE"
  rm -f "$DEPLOY_OUTPUT"
  exit 1
fi