import os
import json
import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
import sys
sys.path.append('/opt/python')
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'utils'))
from auth import require_auth, create_response, get_tenant_id, get_user_id

def lambda_handler(event, context):
    @require_auth
    def _handler(event, context):
        try:
            tenant_id = get_tenant_id(event)
            user_id = get_user_id(event)
            compra_id = event.get('pathParameters', {}).get('compra_id')
            if not tenant_id or not user_id or not compra_id:
                return create_response(400, {'success': False, 'error': 'Datos insuficientes'})
            dynamodb = boto3.resource('dynamodb')
            compras_table = dynamodb.Table(os.environ.get('COMPRAS_TABLE', 'compras-dev'))
            response = compras_table.get_item(
                Key={
                    'tenant_id': tenant_id,
                    'SK': f'COMPRA#{compra_id}'
                }
            )
            item = response.get('Item')
            if not item:
                return create_response(404, {'success': False, 'error': 'Compra no encontrada'})
            return create_response(200, {'success': True, 'data': item})
        except Exception as e:
            print(f"Error interno: {e}")
            return create_response(500, {'success': False, 'error': 'Error interno del servidor'})
    return _handler(event, context)
