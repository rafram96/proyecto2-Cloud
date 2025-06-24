import os
import json
import boto3
import hashlib
import uuid
import jwt
from datetime import datetime, timedelta

# HEADER y dinamodb init
HEADERS = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}
dynamodb = boto3.resource('dynamodb')
USERS_TABLE = os.environ['USUARIOS_TABLE']
JWT_SECRET = os.environ['JWT_SECRET']

# Hashear contraseña
def hash_password(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def lambda_handler(event, context):
    try:
        raw = event.get('body', '{}')
        data = json.loads(raw) if isinstance(raw, str) else raw
        tenant_id = data.get('tenant_id')
        email = data.get('email')
        password = data.get('password')
        # validar campos
        if not all([tenant_id, email, password]):
            return {'statusCode':400,'headers':HEADERS,'body':json.dumps({'error':'Faltan parámetros'})}
        # verificar user
        table = dynamodb.Table(USERS_TABLE)
        r = table.get_item(Key={'email':email,'tenant_id':tenant_id})
        user = r.get('Item')
        if not user or hash_password(password)!=user.get('password'):
            return {'statusCode':401,'headers':HEADERS,'body':json.dumps({'error':'Credenciales inválidas'})}
        # generar JWT
        payload = {
            'user_id': user['user_id'],
            'email': user['email'],
            'tenant_id': tenant_id,
            'exp': datetime.utcnow() + timedelta(hours=1)
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
        # response
        resp = {'message':'Login exitoso','token':token,'user':{'user_id':user['user_id'],'email':user['email'],'tenant_id':tenant_id}}
        return {'statusCode':200,'headers':HEADERS,'body':json.dumps(resp)}
    except Exception as e:
        return {'statusCode':500,'headers':HEADERS,'body':json.dumps({'error':str(e)})}
