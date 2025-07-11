import json
import jwt
import os
from typing import Dict, Any

JWT_SECRET = os.environ.get('JWT_SECRET', 'mi-jwt-secret-super-seguro-y-secreto')

def create_response(status_code: int, body: Dict[str, Any], cors: bool = True) -> Dict[str, Any]:
    """Crea una respuesta HTTP estándar con headers CORS"""
    headers = {
        'Content-Type': 'application/json'
    }
    
    if cors:
        headers.update({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Tenant-Id,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        })
    
    return {
        'statusCode': status_code,
        'headers': headers,
        'body': json.dumps(body, ensure_ascii=False, default=str)
    }

def validate_jwt(event: Dict[str, Any]) -> Dict[str, Any]:
    """Valida el token JWT y retorna el payload"""
    try:
        auth_header = event.get('headers', {}).get('Authorization') or event.get('headers', {}).get('authorization')
        if not auth_header:
            raise ValueError('Token de autorización requerido')
        
        token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else auth_header
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError('Token expirado')
    except jwt.InvalidTokenError:
        raise ValueError('Token inválido')

def require_auth(handler):
    """Decorador para proteger endpoints con JWT"""
    def wrapper(event, context):
        # Manejar CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return create_response(200, {'message': 'CORS preflight'})
        
        try:
            # Validar JWT
            payload = validate_jwt(event)
            event['user_context'] = {
                'user_id': payload.get('user_id'),
                'email': payload.get('email'),
                'tenant_id': payload.get('tenant_id')
            }
            
            # Ejecutar handler original
            return handler(event, context)
        except ValueError as e:
            return create_response(401, {'success': False, 'error': str(e)})
        except Exception as e:
            return create_response(500, {'success': False, 'error': 'Error interno del servidor'})
    
    return wrapper

def get_tenant_id(event: Dict[str, Any]) -> str:
    """Obtiene el tenant_id desde el contexto del usuario"""
    user_context = event.get('user_context', {})
    return user_context.get('tenant_id')

def get_user_id(event: Dict[str, Any]) -> str:
    """Obtiene el user_id desde el contexto del usuario"""
    user_context = event.get('user_context', {})
    return user_context.get('user_id')
