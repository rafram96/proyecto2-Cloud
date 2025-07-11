import boto3
import os
from typing import Dict, List, Any, Optional
from boto3.dynamodb.conditions import Key, Attr
import uuid
from datetime import datetime

# Configuración de DynamoDB
dynamodb = boto3.resource('dynamodb')
COMPRAS_TABLE = os.environ.get('COMPRAS_TABLE', 'compras-dev')

def get_compras_table():
    """Obtiene la tabla de compras"""
    return dynamodb.Table(COMPRAS_TABLE)

def crear_compra_record(tenant_id: str, user_id: str, compra_data: Dict[str, Any]) -> Dict[str, Any]:
    """Crea un registro de compra en DynamoDB"""
    table = get_compras_table()
    
    # Generar ID único para la compra
    compra_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat()
    
    item = {
        'tenant_id': tenant_id,
        'SK': f"COMPRA#{compra_id}",
        'compra_id': compra_id,
        'user_id': user_id,
        'fecha_compra': timestamp,
        'productos': compra_data['productos'],  # Lista de productos con cantidades
        'total': compra_data['total'],
        'estado': compra_data.get('estado', 'COMPLETADA'),
        'metodo_pago': compra_data.get('metodo_pago', 'TARJETA'),
        'direccion_entrega': compra_data.get('direccion_entrega', ''),
        'created_at': timestamp,
        'updated_at': timestamp
    }
    
    table.put_item(Item=item)
    return item

def listar_compras_usuario(tenant_id: str, user_id: str, limit: int = 20, last_key: Optional[str] = None) -> Dict[str, Any]:
    """Lista las compras de un usuario específico usando el GSI"""
    table = get_compras_table()
    
    try:
        query_params = {
            'IndexName': 'UserComprasIndex',
            'KeyConditionExpression': Key('tenant_id').eq(tenant_id) & Key('user_id').eq(user_id),
            'ScanIndexForward': False,  # Ordenar por fecha descendente
            'Limit': limit
        }
        
        # Agregar paginación si existe
        if last_key:
            try:
                import json
                decoded_key = json.loads(last_key)
                query_params['ExclusiveStartKey'] = decoded_key
            except:
                pass  # Ignorar si no se puede decodificar
        
        response = table.query(**query_params)
        
        return {
            'Items': response.get('Items', []),
            'LastEvaluatedKey': response.get('LastEvaluatedKey'),
            'Count': response.get('Count', 0)
        }
    except Exception as e:
        print(f"Error listando compras: {e}")
        return {'Items': [], 'Count': 0}

def listar_compras_tenant(tenant_id: str, limit: int = 50, last_key: Optional[str] = None) -> Dict[str, Any]:
    """Lista todas las compras de un tenant (para reportes)"""
    table = get_compras_table()
    
    try:
        query_params = {
            'KeyConditionExpression': Key('tenant_id').eq(tenant_id),
            'FilterExpression': Attr('SK').begins_with('COMPRA#'),
            'ScanIndexForward': False,
            'Limit': limit
        }
        
        if last_key:
            try:
                import json
                decoded_key = json.loads(last_key)
                query_params['ExclusiveStartKey'] = decoded_key
            except:
                pass
        
        response = table.query(**query_params)
        
        return {
            'Items': response.get('Items', []),
            'LastEvaluatedKey': response.get('LastEvaluatedKey'),
            'Count': response.get('Count', 0)
        }
    except Exception as e:
        print(f"Error listando compras del tenant: {e}")
        return {'Items': [], 'Count': 0}

def obtener_compra(tenant_id: str, compra_id: str) -> Optional[Dict[str, Any]]:
    """Obtiene una compra específica"""
    table = get_compras_table()
    
    try:
        response = table.get_item(
            Key={
                'tenant_id': tenant_id,
                'SK': f"COMPRA#{compra_id}"
            }
        )
        return response.get('Item')
    except Exception as e:
        print(f"Error obteniendo compra: {e}")
        return None

def actualizar_estado_compra(tenant_id: str, compra_id: str, nuevo_estado: str) -> bool:
    """Actualiza el estado de una compra"""
    table = get_compras_table()
    
    try:
        timestamp = datetime.utcnow().isoformat()
        
        table.update_item(
            Key={
                'tenant_id': tenant_id,
                'SK': f"COMPRA#{compra_id}"
            },
            UpdateExpression='SET estado = :estado, updated_at = :timestamp',
            ExpressionAttributeValues={
                ':estado': nuevo_estado,
                ':timestamp': timestamp
            }
        )
        return True
    except Exception as e:
        print(f"Error actualizando estado de compra: {e}")
        return False

def get_compras_stats(tenant_id: str, user_id: Optional[str] = None) -> Dict[str, Any]:
    """Obtiene estadísticas de compras para un tenant o usuario"""
    table = get_compras_table()
    
    try:
        if user_id:
            # Estadísticas de un usuario específico
            response = table.query(
                IndexName='UserComprasIndex',
                KeyConditionExpression=Key('tenant_id').eq(tenant_id) & Key('user_id').eq(user_id),
                Select='ALL_ATTRIBUTES'
            )
        else:
            # Estadísticas del tenant completo
            response = table.query(
                KeyConditionExpression=Key('tenant_id').eq(tenant_id),
                FilterExpression=Attr('SK').begins_with('COMPRA#'),
                Select='ALL_ATTRIBUTES'
            )
        
        compras = response.get('Items', [])
        
        # Calcular estadísticas
        total_compras = len(compras)
        total_monto = sum(float(compra.get('total', 0)) for compra in compras)
        
        estados = {}
        metodos_pago = {}
        
        for compra in compras:
            estado = compra.get('estado', 'DESCONOCIDO')
            metodo = compra.get('metodo_pago', 'DESCONOCIDO')
            
            estados[estado] = estados.get(estado, 0) + 1
            metodos_pago[metodo] = metodos_pago.get(metodo, 0) + 1
        
        return {
            'total_compras': total_compras,
            'total_monto': total_monto,
            'promedio_compra': total_monto / total_compras if total_compras > 0 else 0,
            'estados': estados,
            'metodos_pago': metodos_pago,
            'tenant_id': tenant_id,
            'user_id': user_id
        }
        
    except Exception as e:
        print(f"Error obteniendo estadísticas: {e}")
        return {
            'total_compras': 0,
            'total_monto': 0,
            'promedio_compra': 0,
            'estados': {},
            'metodos_pago': {},
            'tenant_id': tenant_id,
            'user_id': user_id
        }
