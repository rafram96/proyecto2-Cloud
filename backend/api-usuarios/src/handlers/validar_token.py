import json
import os
import jwt
from datetime import datetime

# Función que valida el token JWT (invocada por otras Lambdas)
def lambda_handler(event, context):
    try:
        print(event)
        
        # Obtener token del evento (viene de otra Lambda)
        token = event.get('token')
        if not token:
            # Si viene de API Gateway, extraer del header
            if 'headers' in event:
                auth_header = event.get('headers', {}).get('Authorization')
                if not auth_header:
                    mensaje = {
                        'error': 'Token de autorización requerido'
                    }
                    return {
                        'statusCode': 401,
                        'body': mensaje
                    }
                
                # Extraer token (formato: "Bearer <token>")
                try:
                    token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else auth_header
                except IndexError:
                    mensaje = {
                        'error': 'Formato de token inválido'
                    }
                    return {
                        'statusCode': 401,
                        'body': mensaje
                    }
            else:
                mensaje = {
                    'error': 'Token requerido'
                }
                return {
                    'statusCode': 401,
                    'body': mensaje
                }
        
        # Validar y decodificar token JWT
        try:
            payload = jwt.decode(token, os.environ['JWT_SECRET'], algorithms=['HS256'])
            
            # Verificar expiración manualmente (por seguridad adicional)
            if 'exp' in payload:
                exp_timestamp = payload['exp']
                if isinstance(exp_timestamp, datetime):
                    exp_timestamp = exp_timestamp.timestamp()
                
                if datetime.utcnow().timestamp() > exp_timestamp:
                    mensaje = {
                        'error': 'Token expirado'
                    }
                    return {
                        'statusCode': 403,
                        'body': mensaje
                    }
            
            # Retornar información del usuario si el token es válido
            mensaje = {
                'message': 'Token válido',
                'user': {
                    'user_id': payload.get('user_id'),
                    'email': payload.get('email'),
                    'tenant_id': payload.get('tenant_id'),
                    'nombre': payload.get('nombre', '')
                },
                'token_info': {
                    'issued_at': payload.get('iat'),
                    'expires_at': payload.get('exp')
                }
            }
            return {
                'statusCode': 200,
                'body': mensaje
            }
            
        except jwt.ExpiredSignatureError:
            mensaje = {
                'error': 'Token expirado'
            }
            return {
                'statusCode': 403,
                'body': mensaje
            }
        except jwt.InvalidTokenError:
            mensaje = {
                'error': 'Token inválido'
            }
            return {
                'statusCode': 403,
                'body': mensaje
            }
        except Exception as e:
            print(f"Error al decodificar token: {str(e)}")
            mensaje = {
                'error': 'Token inválido'
            }
            return {
                'statusCode': 403,
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
