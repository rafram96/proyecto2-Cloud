import os
import json
import boto3
import hashlib
import uuid
from datetime import datetime, timedelta

HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
}

dynamodb = boto3.resource('dynamodb')
USERS_TABLE = os.environ['USERS_TABLE']
TOKENS_TABLE = os.environ.get('TOKENS_TABLE')  # opcional

# Función para hashear contraseña
def hash_password(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def lambda_handler(event, context):
    try:
        data = json.loads(event.get('body', '{}'))
        tenant_id = data.get('tenant_id')
        email = data.get('email')
        password = data.get('password')

        if not all([tenant_id, email, password]):
            resp = {'error': 'Faltan parámetros tenant_id, email o password'}
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps(resp)}

        # Verificar usuario
        table = dynamodb.Table(USERS_TABLE)
        existing = table.get_item(Key={'email': email, 'tenant_id': tenant_id})
        user = existing.get('Item')
        if not user or hash_password(password) != user.get('password'):
            resp = {'error': 'Credenciales inválidas'}
            return {'statusCode': 401, 'headers': HEADERS, 'body': json.dumps(resp)}

        # Generar token UUID con expiración opcional
        token = str(uuid.uuid4())
        expires = (datetime.utcnow() + timedelta(hours=1)).isoformat()
        # Aquí podrías guardar el token en TOKENS_TABLE

        resp = {
            'message': 'Login exitoso',
            'token': token,
            'user': {
                'user_id': user['user_id'],
                'email': user['email'],
                'nombre': user.get('nombre',''),
                'tenant_id': tenant_id
            },
            'expires': expires
        }
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps(resp)}

    except Exception as e:
        resp = {'error': str(e)}
        return {'statusCode': 500, 'headers': HEADERS, 'body': json.dumps(resp)}
