import json
import os
import hashlib
import jwt
import boto3
from datetime import datetime, timedelta
from botocore.exceptions import ClientError

# Hashear contraseña para comparación
def hash_password(password):
    # Retorna la contraseña hasheada usando SHA256
    return hashlib.sha256(password.encode()).hexdigest()

# Función que maneja el login de usuario
def lambda_handler(event, context):
    try:
        print(event)
        
        # Manejar el caso en que body sea string o diccionario
        if isinstance(event['body'], str):
            body = json.loads(event['body'])
        else:
            body = event['body']
        
        # Obtener datos del login
        email = body.get('email')
        password = body.get('password')
        tenant_id = body.get('tenant_id')
        
        # Verificar que los campos requeridos existen
        if email and password and tenant_id:            # Conectar DynamoDB
            dynamodb = boto3.resource('dynamodb')
            t_usuarios = dynamodb.Table(os.environ['USUARIOS_TABLE'])
            
            # Buscar usuario usando la nueva estructura: PK = tenant_id#user_id, SK = email  
            try:
                response = t_usuarios.scan(
                    FilterExpression='SK = :email AND begins_with(PK, :tenant_prefix)',
                    ExpressionAttributeValues={
                        ':email': email,
                        ':tenant_prefix': f"{tenant_id}#"
                    }
                )
                
                if not response['Items']:
                    mensaje = {
                        'error': 'Credenciales inválidas'
                    }
                    return {
                        'statusCode': 401,
                        'body': mensaje
                    }
                
                user = response['Items'][0]  # Tomar el primer (y único) resultado
                
                # Verificar si el usuario está activo
                if not user.get('active', True):
                    mensaje = {
                        'error': 'Usuario inactivo'
                    }
                    return {
                        'statusCode': 401,
                        'body': mensaje
                    }
                
            except ClientError as e:
                print(f"Error al buscar usuario: {e}")
                mensaje = {
                    'error': 'Error interno del servidor'
                }
                return {
                    'statusCode': 500,
                    'body': mensaje
                }
            
            # Verificar contraseña hasheada
            hashed_input_password = hash_password(password)
            if hashed_input_password != user['password']:
                mensaje = {
                    'error': 'Credenciales inválidas'
                }
                return {
                    'statusCode': 401,
                    'body': mensaje
                }
              # Generar token JWT con expiración de 1 hora
            payload = {
                'usuario_id': user['usuario_id'],
                'email': user['email'],
                'tenant_id': tenant_id,
                'nombre': user.get('nombre', ''),
                'iat': datetime.utcnow(),
                'exp': datetime.utcnow() + timedelta(hours=1)
            }
            
            token = jwt.encode(payload, os.environ['JWT_SECRET'], algorithm='HS256')
              # Retornar un código de estado HTTP 200 (OK) y el token
            mensaje = {
                'message': 'Login exitoso',
                'token': token,
                'user': {
                    'usuario_id': user['usuario_id'],
                    'email': user['email'],
                    'nombre': user.get('nombre', ''),
                    'tenant_id': tenant_id
                },
                'expires_in': 3600  # 1 hora en segundos
            }
            return {
                'statusCode': 200,
                'body': mensaje
            }
        else:
            mensaje = {
                'error': 'Campos requeridos: email, password, tenant_id'
            }
            return {
                'statusCode': 400,
                'body': mensaje
            }

    except json.JSONDecodeError:
        mensaje = {
            'error': 'JSON inválido'
        }
        return {
            'statusCode': 400,
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
