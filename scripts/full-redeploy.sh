#!/bin/bash
set -e

# === PARÁMETROS ===
SKIP_CLONE=false
for arg in "$@"; do
  if [[ "$arg" == "--no-clone" ]]; then
    SKIP_CLONE=true
  fi
done

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR=~/logs
MASTER_LOG="$LOG_DIR/full_redeploy_$TIMESTAMP.log"
mkdir -p "$LOG_DIR"

echo "📦 Iniciando redeploy completo ($TIMESTAMP)..." | tee -a "$MASTER_LOG"

# === 1. Clonar repositorio (a menos que se indique --no-clone)
if [ "$SKIP_CLONE" = false ]; then
  echo "📥 Clonando repositorio..." | tee -a "$MASTER_LOG"
  ~/scripts/clone.sh >> "$MASTER_LOG" 2>&1
else
  echo "⏭️  Clonado del repositorio omitido (--no-clone)" | tee -a "$MASTER_LOG"
fi

# === 2. Desplegar microservicios (con logs individuales)
~/scripts/deploy-usuarios.sh "$TIMESTAMP"
~/scripts/deploy-productos.sh "$TIMESTAMP"
~/scripts/deploy-compras.sh "$TIMESTAMP"

# === 3. Mostrar endpoints
echo -e "\n🌐 Endpoints desplegados:" | tee -a "$MASTER_LOG"
grep -hE "https://.*\.amazonaws\.com" "$LOG_DIR"/api_*_"$TIMESTAMP".log | tee -a "$MASTER_LOG"

echo -e "\n✅ Redeploy completo finalizado exitosamente"
echo "📄 Log maestro guardado en: $MASTER_LOG"
