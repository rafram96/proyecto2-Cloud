#!/bin/bash
set -e

# CONFIGURACIÓN
BASE_DIR=~/proyecto2-Cloud/backend
APIS=("api-usuarios" "api-productos" "api-compras")
STAGES=("dev" "test" "prod")

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_ROOT=~/logs/deploy
mkdir -p "$LOG_ROOT"

# FUNCIONES
check_sls_errors() {
  local log_file="$1"
  local operation="$2"
  local api="$3"
  local stage="$4"
  
  if [ ! -f "$log_file" ]; then
    echo "⚠️  [${api}/${stage}] Log no encontrado: $log_file"
    return 1
  fi
  
  # Buscar errores específicos comunes
  local s3_errors=$(grep -i "s3.*error\|bucket.*error\|access.*denied.*s3" "$log_file" 2>/dev/null || true)
  local s3_not_empty=$(grep -i "bucket.*not.*empty\|bucket.*contains.*objects\|delete.*bucket.*failed.*not.*empty\|bucketnotempty" "$log_file" 2>/dev/null || true)
  local s3_access_denied=$(grep -i "s3.*access.*denied\|bucket.*access.*denied\|s3.*403\|forbidden.*s3" "$log_file" 2>/dev/null || true)
  local s3_versioning=$(grep -i "versioning.*enabled\|delete.*marker\|version.*conflict" "$log_file" 2>/dev/null || true)
  local lambda_errors=$(grep -i "lambda.*error\|function.*error\|execution.*role" "$log_file" 2>/dev/null || true)
  local api_gw_errors=$(grep -i "api.*gateway.*error\|rest.*api.*error" "$log_file" 2>/dev/null || true)
  local dynamo_errors=$(grep -i "dynamodb.*error\|table.*error" "$log_file" 2>/dev/null || true)
  local permission_errors=$(grep -i "access.*denied\|permission.*denied\|unauthorized" "$log_file" 2>/dev/null || true)
  local cloudformation_errors=$(grep -i "cloudformation.*error\|stack.*error\|rollback" "$log_file" 2>/dev/null || true)
  
  local has_errors=false
  
  if [ -n "$s3_not_empty" ]; then
    echo "🔴 [${api}/${stage}] ⚠️  BUCKET S3 NO VACÍO detectado en $operation:" | tee -a "$log_file"
    echo "$s3_not_empty" | head -3 | sed 's/^/   /' | tee -a "$log_file"
    echo "   💡 Solución: Vaciar el bucket manualmente o usar --force" | tee -a "$log_file"
    echo "   💡 Comando: aws s3 rm s3://nombre-bucket --recursive" | tee -a "$log_file"
    has_errors=true
  fi
  
  if [ -n "$s3_access_denied" ]; then
    echo "🔴 [${api}/${stage}] 🚫 PERMISOS S3 DENEGADOS detectado en $operation:" | tee -a "$log_file"
    echo "$s3_access_denied" | head -3 | sed 's/^/   /' | tee -a "$log_file"
    echo "   💡 Solución: Verificar políticas IAM para S3" | tee -a "$log_file"
    has_errors=true
  fi
  
  if [ -n "$s3_versioning" ]; then
    echo "🔴 [${api}/${stage}] 📦 VERSIONING S3 ACTIVO detectado en $operation:" | tee -a "$log_file"
    echo "$s3_versioning" | head -3 | sed 's/^/   /' | tee -a "$log_file"
    echo "   💡 Solución: Eliminar todas las versiones del bucket" | tee -a "$log_file"
    echo "   💡 Comando: aws s3api delete-object-versions ..." | tee -a "$log_file"
    has_errors=true
  fi
  
  if [ -n "$s3_errors" ] && [ "$has_errors" = false ]; then
    echo "🔴 [${api}/${stage}] Errores generales de S3 detectados en $operation:" | tee -a "$log_file"
    echo "$s3_errors" | head -3 | sed 's/^/   /' | tee -a "$log_file"
    has_errors=true
  fi
  
  if [ -n "$lambda_errors" ]; then
    echo "🔴 [${api}/${stage}] Errores de Lambda detectados en $operation:" | tee -a "$log_file"
    echo "$lambda_errors" | head -3 | sed 's/^/   /' | tee -a "$log_file"
    has_errors=true
  fi
  
  if [ -n "$api_gw_errors" ]; then
    echo "🔴 [${api}/${stage}] Errores de API Gateway detectados en $operation:" | tee -a "$log_file"
    echo "$api_gw_errors" | head -3 | sed 's/^/   /' | tee -a "$log_file"
    has_errors=true
  fi
  
  if [ -n "$dynamo_errors" ]; then
    echo "🔴 [${api}/${stage}] Errores de DynamoDB detectados en $operation:" | tee -a "$log_file"
    echo "$dynamo_errors" | head -3 | sed 's/^/   /' | tee -a "$log_file"
    has_errors=true
  fi
  
  if [ -n "$permission_errors" ]; then
    echo "🔴 [${api}/${stage}] Errores de permisos detectados en $operation:" | tee -a "$log_file"
    echo "$permission_errors" | head -3 | sed 's/^/   /' | tee -a "$log_file"
    has_errors=true
  fi
  
  if [ -n "$cloudformation_errors" ]; then
    echo "🔴 [${api}/${stage}] Errores de CloudFormation detectados en $operation:" | tee -a "$log_file"
    echo "$cloudformation_errors" | head -3 | sed 's/^/   /' | tee -a "$log_file"
    has_errors=true
  fi
  
  # Buscar patrones generales de error
  local general_errors=$(grep -i "error:\|failed:\|exception:" "$log_file" | grep -v "Warning" 2>/dev/null || true)
  if [ -n "$general_errors" ] && [ "$has_errors" = false ]; then
    echo "🔴 [${api}/${stage}] Errores generales detectados en $operation:" | tee -a "$log_file"
    echo "$general_errors" | head -5 | sed 's/^/   /' | tee -a "$log_file"
    has_errors=true
  fi
  
  if [ "$has_errors" = true ]; then
    echo "📋 [${api}/${stage}] Ver log completo: $log_file" | tee -a "$log_file"
    return 1
  fi
  
  return 0
}

deploy_api() {
  local api=$1
  local stage=$2
  local log_dir="$LOG_ROOT/${api}_${stage}"
  local log_file="$log_dir/deploy_${TIMESTAMP}.log"
  local api_path="${BASE_DIR}/${api}"
  local remove_log="${log_dir}/remove_${TIMESTAMP}.log"

  mkdir -p "$log_dir"

  if [ ! -d "$api_path" ]; then
    echo "❌ [${api}/${stage}] Directorio no encontrado: $api_path" | tee -a "$log_file"
    return 1
  fi

  cd "$api_path"

  # Remove con análisis de errores mejorado
  echo "🗑️ [${api}/${stage}] Eliminando stack previo..." | tee -a "$log_file"
  if sls remove -s "$stage" > "$remove_log" 2>&1; then
    echo "✅ [${api}/${stage}] Stack eliminado correctamente" | tee -a "$log_file"
    cat "$remove_log" >> "$log_file"
  else
    local exit_code=$?
    cat "$remove_log" >> "$log_file"
    
    # Verificar si es un error normal (stack no existe) o un error real
    if grep -q "does not exist\|stack.*not.*found\|No stack named" "$remove_log" 2>/dev/null; then
      echo "ℹ️  [${api}/${stage}] Stack no existía previamente (normal)" | tee -a "$log_file"
    else
      echo "⚠️  [${api}/${stage}] Fallo al eliminar stack (código: $exit_code)" | tee -a "$log_file"
      check_sls_errors "$remove_log" "REMOVE" "$api" "$stage"
    fi
  fi

  # Deploy con análisis de errores mejorado
  echo "🚀 [${api}/${stage}] Desplegando..." | tee -a "$log_file"
  local deploy_out
  deploy_out=$(mktemp)

  if sls deploy -s "$stage" > "$deploy_out" 2>&1; then
    cat "$deploy_out" >> "$log_file"
    echo "✅ [${api}/${stage}] Despliegue exitoso." | tee -a "$log_file"
    
    # Extraer información útil del deploy
    echo -e "\n📊 [${api}/${stage}] Información del deployment:" | tee -a "$log_file"
    
    # Stack name
    local stack_name=$(grep -o "Service Information.*" -A 10 "$deploy_out" | grep "service:" | awk '{print $2}' 2>/dev/null || echo "N/A")
    echo "   📦 Stack: $stack_name" | tee -a "$log_file"
    
    # Region
    local region=$(grep -o "region:" "$deploy_out" | head -1 | awk '{print $2}' 2>/dev/null || echo "N/A")
    echo "   🌍 Región: $region" | tee -a "$log_file"
    
    # Functions deployed
    local functions=$(grep -o "functions:" -A 20 "$deploy_out" | grep -E "^\s+\w+" | wc -l 2>/dev/null || echo "0")
    echo "   ⚡ Funciones: $functions" | tee -a "$log_file"
    
    echo -e "\n🌐 [${api}/${stage}] Endpoints disponibles:" | tee -a "$log_file"
    if grep -E "https://.*\.amazonaws\.com" "$deploy_out" > /dev/null 2>&1; then
      grep -E "https://.*\.amazonaws\.com" "$deploy_out" | sort -u | sed 's/^/   /' | tee -a "$log_file"
    else
      echo "   ⚠️  No se encontraron endpoints HTTP" | tee -a "$log_file"
    fi
    
    rm -f "$deploy_out"
    return 0
  else
    local exit_code=$?
    cat "$deploy_out" >> "$log_file"
    echo "❌ [${api}/${stage}] Error durante despliegue (código: $exit_code)" | tee -a "$log_file"
    
    # Análisis detallado de errores
    check_sls_errors "$deploy_out" "DEPLOY" "$api" "$stage"
    
    # Mostrar últimas líneas del error para contexto inmediato
    echo "🔍 [${api}/${stage}] Últimas líneas del error:" | tee -a "$log_file"
    tail -10 "$deploy_out" | sed 's/^/   /' | tee -a "$log_file"
    
    rm -f "$deploy_out"
    return 1
  fi
}

# EJECUCIÓN
echo "🚀 Iniciando despliegue de APIs en stages: ${STAGES[*]}"
echo "📂 Logs se guardarán en: $LOG_ROOT"
echo "📅 Timestamp: $TIMESTAMP"
echo ""

total_deployments=$((${#APIS[@]} * ${#STAGES[@]}))
successful_deployments=0
failed_deployments=0
current_deployment=0

for stage in "${STAGES[@]}"; do
  echo "🏗️  ======== STAGE: $stage ========"
  for api in "${APIS[@]}"; do
    ((current_deployment++))
    echo ""
    echo "🔧 [$current_deployment/$total_deployments] Desplegando $api en stage $stage..."
    
    if deploy_api "$api" "$stage"; then
      ((successful_deployments++))
      echo "✅ [$current_deployment/$total_deployments] $api/$stage completado"
    else
      ((failed_deployments++))
      echo "❌ [$current_deployment/$total_deployments] $api/$stage falló"
    fi
  done
  echo ""
done

echo "🎯 ======== RESUMEN FINAL ========"
echo "📊 Total deployments: $total_deployments"
echo "✅ Exitosos: $successful_deployments"
echo "❌ Fallidos: $failed_deployments"
echo "📦 Logs disponibles en: $LOG_ROOT"
echo ""

if [ $failed_deployments -eq 0 ]; then
  echo "🎉 ¡Todos los deployments completados exitosamente!"
else
  echo "⚠️  $failed_deployments deployment(s) fallaron. Revisa los logs para detalles."
  echo "🔍 Para ver errores específicos:"
  echo "   find $LOG_ROOT -name '*.log' -exec grep -l 'Error\|Failed' {} \;"
fi

echo ""
echo "📋 Comandos útiles:"
echo "   # Ver todos los logs de errores:"
echo "   find $LOG_ROOT -name '*.log' -exec grep -l '🔴\|❌' {} \;"
echo ""
echo "   # Ver log específico:"
echo "   tail -f $LOG_ROOT/[api]_[stage]/deploy_$TIMESTAMP.log"
