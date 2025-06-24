import os
import json
import boto3
import hashlib
import uuid

HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
}

dynamodb = boto3.resource('dynamodb')
USERS_TABLE = os.environ['USUARIOS_TABLE']

# Función para hashear contraseña
def hash_password(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def lambda_handler(event, context):
    try:
        raw_body = event.get('body', '{}')
        if isinstance(raw_body, str):
            data = json.loads(raw_body)
        else:
            data = raw_body
        tenant_id = data.get('tenant_id')
        email = data.get('email')
        password = data.get('password')
        nombre = data.get('nombre')

        # Validar campos
        if not all([tenant_id, email, password, nombre]):
            resp = {'error': 'Faltan parámetros tenant_id, email, password o nombre'}
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps(resp)}

        table = dynamodb.Table(USERS_TABLE)
        # Verificar usuario existente
        existing = table.get_item(Key={'email': email, 'tenant_id': tenant_id})
        if 'Item' in existing:
            resp = {'error': 'Usuario ya existe'}
            return {'statusCode': 409, 'headers': HEADERS, 'body': json.dumps(resp)}

        # Crear usuario
        user_id = str(uuid.uuid4())
        hashed = hash_password(password)
        table.put_item(Item={
            'tenant_id': tenant_id,
            'user_id': user_id,
            'email': email,
            'password': hashed,
            'nombre': nombre
        })

        resp = {'message': 'Usuario registrado', 'user_id': user_id}
        return {'statusCode': 201, 'headers': HEADERS, 'body': json.dumps(resp)}

    except Exception as e:
        resp = {'error': str(e)}
        return {'statusCode': 500, 'headers': HEADERS, 'body': json.dumps(resp)}
