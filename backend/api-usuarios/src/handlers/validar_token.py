import os
import json
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
from datetime import datetime

# Encabezados CORS y content-type
HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
}

# Función que valida el token (usando JWT)
def lambda_handler(event, context):
    try:
        # Extraer token de header o body
        token = None
        auth_header = event.get('headers', {}).get('Authorization') if 'headers' in event else None
        if auth_header:
            token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else auth_header
        if not token and 'body' in event:
            body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
            token = body.get('token')
        if not token:
            return {'statusCode': 401,'headers': HEADERS,'body': json.dumps({'error':'Token de autorización requerido'})}
        
        # Decodificar y validar JWT
        jwt_secret = os.environ.get('JWT_SECRET')
        try:
            payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])
            mensaje = {'message':'Token válido','valid':True,'payload':payload}
            return {'statusCode':200,'headers':HEADERS,'body':json.dumps(mensaje)}
        except ExpiredSignatureError:
            return {'statusCode':401,'headers':HEADERS,'body':json.dumps({'error':'Token expirado'})}
        except InvalidTokenError:
            return {'statusCode':401,'headers':HEADERS,'body':json.dumps({'error':'Token inválido'})}
    except Exception as e:
        return {'statusCode':500,'headers':HEADERS,'body':json.dumps({'error':str(e)})}
