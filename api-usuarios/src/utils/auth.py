import os
import jwt
import json

JWT_SECRET = os.environ['JWT_SECRET']

def validate_jwt_token(token):
    """
    Valida un token JWT y retorna el payload decodificado
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload, None
    except jwt.ExpiredSignatureError:
        return None, 'Token expirado'
    except jwt.InvalidTokenError:
        return None, 'Token inválido'
    except Exception as e:
        return None, f'Error al validar token: {str(e)}'

def extract_token_from_event(event):
    """
    Extrae el token JWT del evento de API Gateway
    """
    auth_header = event.get('headers', {}).get('Authorization')
    if not auth_header:
        return None, 'Token de autorización requerido'
    
    try:
        token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else auth_header
        return token, None
    except IndexError:
        return None, 'Formato de token inválido'

def create_auth_response(status_code, message, data=None):
    """
    Crea una respuesta estándar para autenticación
    """
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    }
    
    body = {'message': message}
    if data:
        body.update(data)
    
    return {
        'statusCode': status_code,
        'headers': headers,
        'body': json.dumps(body)
    }

def get_user_context_from_token(event):
    """
    Extrae y valida el contexto del usuario desde el token JWT
    Retorna: (user_context, error_response)
    """
    token, error = extract_token_from_event(event)
    if error:
        return None, create_auth_response(401, error)
    
    payload, error = validate_jwt_token(token)
    if error:
        return None, create_auth_response(401, error)
    user_context = {
        'user_id': payload.get('user_id'),
        'email': payload.get('email'),
        'tenant_id': payload.get('tenant_id'),
        'nombre': payload.get('nombre', '')
    }
    
    return user_context, None
