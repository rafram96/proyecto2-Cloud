import json
import os
import boto3
from botocore.exceptions import ClientError

# Función que lista las compras de un usuario
def lambda_handler(event, context):
    try:
        print(event)
        
        # Validar token JWT invocando Lambda ValidarTokenAcceso
        token = event['headers']['Authorization']
        lambda_client = boto3.client('lambda')
        payload_string = json.dumps({'token': token})
        invoke_response = lambda_client.invoke(
            FunctionName='ValidarTokenAcceso',
            InvocationType='RequestResponse',
            Payload=payload_string
        )
        response = json.loads(invoke_response['Payload'].read())
        if response['statusCode'] == 403:
            return {
                'statusCode': 403,
                'status': 'Forbidden - Acceso No Autorizado'
            }
          # Obtener información del usuario desde la validación del token
        user_context = response['body']['user']
        tenant_id = user_context['tenant_id']
        usuario_id = user_context['usuario_id']
        
        # Obtener usuario_id del path parameter o usar el del token
        requested_usuario_id = event.get('pathParameters', {}).get('usuario_id') or usuario_id
        
        # Verificar que el usuario solo pueda ver sus propias compras (seguridad)
        if requested_usuario_id != usuario_id:
            mensaje = {
                'error': 'No autorizado para ver compras de otro usuario'
            }
            return {
                'statusCode': 403,
                'body': mensaje
            }
        
        # Conectar DynamoDB
        dynamodb = boto3.resource('dynamodb')
        t_compras = dynamodb.Table(os.environ['COMPRAS_TABLE'])
        
        # Obtener parámetros de query para paginación
        query_params = event.get('queryStringParameters') or {}
        limit = int(query_params.get('limit', 10))
        last_key = query_params.get('lastKey')
        
        # Validar límite de paginación
        if limit > 50:
            limit = 50  # Máximo 50 compras por consulta
          # Preparar query usando nueva estructura: PK = tenant_id#usuario_id, SK = compra#<compra_id>
        pk = f"{tenant_id}#{usuario_id}"  # PK = tenant_id#usuario_id
        
        query_params_db = {
            'KeyConditionExpression': 'PK = :pk AND begins_with(SK, :compra_prefix)',
            'ExpressionAttributeValues': {
                ':pk': pk,
                ':compra_prefix': 'compra#'
            },
            'Limit': limit,
            'ScanIndexForward': False  # Ordenar por fecha descendente (más recientes primero)
        }
        
        # Agregar paginación si existe
        if last_key:
            try:
                decoded_key = json.loads(last_key)
                query_params_db['ExclusiveStartKey'] = decoded_key
            except:
                pass  # Ignorar si no se puede decodificar
        
        try:
            # Ejecutar query
            response = t_compras.query(**query_params_db)
            
            compras = response.get('Items', [])
            
            # Formatear compras para respuesta
            compras_formateadas = []
            for compra in compras:
                compras_formateadas.append({
                    'compra_id': compra['compra_id'],
                    'productos': compra['productos'],
                    'total': compra['total'],
                    'direccion_entrega': compra['direccion_entrega'],
                    'metodo_pago': compra['metodo_pago'],
                    'estado': compra['estado'],
                    'created_at': compra['created_at']
                })
            
            # Preparar respuesta con información de paginación
            respuesta = {
                'compras': compras_formateadas,
                'count': len(compras_formateadas),
                'usuario_id': usuario_id
            }
            
            # Agregar información de paginación si hay más elementos
            if 'LastEvaluatedKey' in response:
                respuesta['pagination'] = {
                    'hasMore': True,
                    'nextKey': json.dumps(response['LastEvaluatedKey'])
                }
            else:
                respuesta['pagination'] = {
                    'hasMore': False
                }
            
            return {
                'statusCode': 200,
                'body': respuesta
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'ResourceNotFoundException':
                mensaje = {
                    'error': 'La tabla de compras no existe'
                }
                return {
                    'statusCode': 404,
                    'body': mensaje
                }
            else:
                print(f"Error DynamoDB: {e}")
                mensaje = {
                    'error': 'Error al buscar compras'
                }
                return {
                    'statusCode': 500,
                    'body': mensaje
                }

    except Exception as e:
        # Excepción y retornar un código de error HTTP 500
        print("Exception:", str(e))
        mensaje = {
            'error': str(e)
        }        
        return {
            'statusCode': 500,
            'body': mensaje
        }
