import os
import json
import uuid

# Encabezados CORS y content-type
HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
}

# Función que valida el token (simplificada sin JWT)
def lambda_handler(event, context):
    try:
        print(event)
        
        # Obtener token del evento
        token = None
        
        # Si viene de API Gateway, extraer del header
        if 'headers' in event:
            auth_header = event.get('headers', {}).get('Authorization')
            if auth_header:
                # Extraer token (formato: "Bearer <token>")
                try:
                    token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else auth_header
                except IndexError:
                    mensaje = {'error': 'Formato de token inválido'}
                    return {
                        'statusCode': 401,
                        'headers': HEADERS,
                        'body': json.dumps(mensaje)
                    }
        
        # También revisar en el body para compatibilidad
        if not token and 'body' in event:
            if isinstance(event['body'], str):
                body = json.loads(event['body'])
            else:
                body = event['body']
            token = body.get('token')
        
        if not token:
            mensaje = {'error': 'Token de autorización requerido'}
            return {
                'statusCode': 401,
                'headers': HEADERS,
                'body': json.dumps(mensaje)
            }
        
        # Validar que sea un UUID válido (patrón de token simple)
        try:
            uuid.UUID(token)
            mensaje = {'message': 'Token válido', 'valid': True}
            return {
                'statusCode': 200,
                'headers': HEADERS,
                'body': json.dumps(mensaje)
            }
        except ValueError:
            mensaje = {'error': 'Token inválido'}
            return {
                'statusCode': 401,
                'headers': HEADERS,
                'body': json.dumps(mensaje)
            }
    except Exception as e:
        print("Exception:", str(e))
        mensaje = {'error': str(e)}
        return {
            'statusCode': 500,
            'headers': HEADERS,
            'body': json.dumps(mensaje)
        }
