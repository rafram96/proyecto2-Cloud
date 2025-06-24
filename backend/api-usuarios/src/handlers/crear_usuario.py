import json
import os
import hashlib
import uuid
import boto3
from botocore.exceptions import ClientError

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def lambda_handler(event, context):
    try:
        print(event)
        
        if isinstance(event['body'], str):
            body = json.loads(event['body'])
        else:
            body = event['body']
        
        # Obtener datos del usuario
        email = body.get('email')
        password = body.get('password')
        tenant_id = body.get('tenant_id')
        nombre = body.get('nombre')
        
        # Verificar que los campos requeridos existen
        if email and password and tenant_id and nombre:
            # Validar longitud de contraseña
            if len(password) < 8:
                mensaje = {
                    'error': 'La contraseña debe tener al menos 8 caracteres'
                }
                return {
                    'statusCode': 400,
                    'body': mensaje
                }
              # Conectar DynamoDB
            dynamodb = boto3.resource('dynamodb')
            t_usuarios = dynamodb.Table(os.environ['USUARIOS_TABLE'])
            
            # Generar usuario_id único
            usuario_id = str(uuid.uuid4())
            
            # Crear claves primarias compuestas según nueva estructura
            pk = f"{tenant_id}#{usuario_id}"  # PK = tenant_id#user_id
            sk = email  # SK = email
            try:
                response = t_usuarios.scan(
                    FilterExpression='email = :email AND begins_with(PK, :tenant_prefix)',
                    ExpressionAttributeValues={
                        ':email': email,
                        ':tenant_prefix': f"{tenant_id}#"
                    }
                )
                if response['Items']:                    mensaje = {
                        'error': 'El usuario ya existe en este tenant'
                    }
                return {
                        'statusCode': 409,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps(mensaje)
                    }
            except ClientError as e:
                print(f"Error al verificar usuario existente: {e}")
            
            hashed_password = hash_password(password)
              # Almacena los datos del usuario en la tabla de usuarios en DynamoDB
            # Nueva estructura: PK = tenant_id#user_id, SK = email
            t_usuarios.put_item(
                Item={
                    'PK': pk,                # tenant_id#user_id
                    'SK': sk,                # email
                    'tenant_id': tenant_id,
                    'usuario_id': usuario_id,
                    'email': email,
                    'password': hashed_password,
                    'nombre': nombre,
                    'created_at': str(uuid.uuid1().time),
                    'active': True
                }
            )              # Retornar un código de estado HTTP 201 (Created) y un mensaje de éxito
            mensaje = {
                'message': 'Usuario creado exitosamente',
                'usuario_id': usuario_id,
                'email': email,
                'nombre': nombre
            }
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(mensaje)
            }
        else:
            mensaje = {
                'error': 'Campos requeridos: email, password, tenant_id, nombre'
            }
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(mensaje)
            }

    except json.JSONDecodeError:
        mensaje = {
            'error': 'JSON inválido'
        }
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(mensaje)
        }
    except Exception as e:
        # Excepción y retornar un código de error HTTP 500
        print("Exception:", str(e))
        mensaje = {
            'error': str(e)
        }        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(mensaje)
        }
