import json
import os
import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

# Importar utilidades
import sys
sys.path.append('/opt/python')
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'utils'))

from auth import require_auth, create_response, get_tenant_id, get_user_id
from dynamodb import listar_compras_usuario

def lambda_handler(event, context):
    @require_auth
    def _handler(event, context):
        try:
            # Obtener contexto del usuario desde JWT
            tenant_id = get_tenant_id(event)
            user_id = get_user_id(event)
            
            if not tenant_id or not user_id:
                return create_response(400, {
                    'success': False, 
                    'error': 'Información de usuario inválida'
                })

            # Obtener parámetros de consulta
            query_params = event.get('queryStringParameters') or {}
            limit = min(int(query_params.get('limit', 20)), 50)  # Máximo 50
            last_key = query_params.get('lastKey')

            # Conectar a DynamoDB
            dynamodb = boto3.resource('dynamodb')
            compras_table = dynamodb.Table(os.environ.get('COMPRAS_TABLE', 'compras-dev'))

            # Preparar query parameters
            query_params_db = {
                'IndexName': 'UserComprasIndex',
                'KeyConditionExpression': Key('tenant_id').eq(tenant_id) & Key('user_id').eq(user_id),
                'ScanIndexForward': False,  # Ordenar por fecha descendente
                'Limit': limit
            }

            # Agregar paginación si existe
            if last_key:
                try:
                    decoded_key = json.loads(last_key)
                    query_params_db['ExclusiveStartKey'] = decoded_key
                except json.JSONDecodeError:
                    pass  # Ignorar si no se puede decodificar

            # Ejecutar consulta
            try:
                response = compras_table.query(**query_params_db)
                compras = response.get('Items', [])

                # Formatear compras para respuesta
                compras_formateadas = []
                for compra in compras:
                    compras_formateadas.append({
                        'compra_id': compra.get('compra_id'),
                        'productos': compra.get('productos', []),
                        'total': float(compra.get('total', 0)),
                        'direccion_entrega': compra.get('direccion_entrega'),
                        'metodo_pago': compra.get('metodo_pago'),
                        'estado': compra.get('estado'),
                        'fecha_compra': compra.get('fecha_compra'),
                        'created_at': compra.get('created_at')
                    })

                # Preparar respuesta con información de paginación
                respuesta = {
                    'success': True,
                    'data': {
                        'compras': compras_formateadas,
                        'count': len(compras_formateadas),
                        'user_id': user_id,
                        'tenant_id': tenant_id
                    }
                }

                # Agregar información de paginación si hay más elementos
                if 'LastEvaluatedKey' in response:
                    respuesta['data']['pagination'] = {
                        'hasMore': True,
                        'nextKey': json.dumps(response['LastEvaluatedKey'])
                    }
                else:
                    respuesta['data']['pagination'] = {
                        'hasMore': False
                    }

                return create_response(200, respuesta)

            except ClientError as e:
                error_code = e.response['Error']['Code']
                if error_code == 'ResourceNotFoundException':
                    return create_response(404, {
                        'success': False,
                        'error': 'La tabla de compras no existe'
                    })
                else:
                    print(f"Error DynamoDB: {e}")
                    return create_response(500, {
                        'success': False,
                        'error': 'Error al buscar compras'
                    })

        except Exception as e:
            print(f"Error interno: {e}")
            return create_response(500, {
                'success': False,
                'error': 'Error interno del servidor'
            })

    return _handler(event, context)
