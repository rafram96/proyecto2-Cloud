import json
import os
import uuid
import boto3
from datetime import datetime
from botocore.exceptions import ClientError

# Función que crea una nueva compra
def lambda_handler(event, context):
    try:
        print(event)
        
        # Validar token JWT invocando Lambda ValidarTokenAcceso
        token = event['headers']['Authorization']
        lambda_client = boto3.client('lambda')
        payload_string = json.dumps({'token': token})
        invoke_response = lambda_client.invoke(
            FunctionName='ValidarTokenAcceso',
            InvocationType='RequestResponse',
            Payload=payload_string
        )
        response = json.loads(invoke_response['Payload'].read())
        if response['statusCode'] == 403:
            return {
                'statusCode': 403,
                'status': 'Forbidden - Acceso No Autorizado'
            }
        user_context = response['body']['user']
        
        # Manejar el caso en que body sea string o diccionario
        if isinstance(event['body'], str):
            body = json.loads(event['body'])
        else:
            body = event['body']
        
        # Obtener datos de la compra
        productos = body.get('productos')  # Lista de productos con codigo y cantidad
        direccion_entrega = body.get('direccion_entrega')
        metodo_pago = body.get('metodo_pago')
        
        # Obtener tenant_id del contexto del usuario
        tenant_id = user_context['tenant_id']
        usuario_id = user_context['usuario_id']
        
        # Verificar que los campos requeridos existen
        if productos and direccion_entrega and metodo_pago:
            # Validar que productos es una lista no vacía
            if not isinstance(productos, list) or len(productos) == 0:
                mensaje = {
                    'error': 'Debe incluir al menos un producto en la compra'
                }
                return {
                    'statusCode': 400,
                    'body': mensaje
                }
            
            # Conectar DynamoDB
            dynamodb = boto3.resource('dynamodb')
            t_compras = dynamodb.Table(os.environ['COMPRAS_TABLE'])
            t_productos = dynamodb.Table(os.environ['PRODUCTOS_TABLE'])
            
            # Validar existencia de productos y calcular total
            total_compra = 0
            productos_validados = []
            
            for item in productos:
                codigo_producto = item.get('codigo')
                cantidad = item.get('cantidad', 1)
                
                if not codigo_producto or cantidad <= 0:
                    mensaje = {
                        'error': 'Código de producto y cantidad válida requeridos'
                    }
                    return {
                        'statusCode': 400,
                        'body': mensaje
                    }
                  # Buscar producto usando nueva estructura: PK = tenant_id, SK = producto#<codigo>
                try:
                    producto_response = t_productos.get_item(
                        Key={
                            'PK': tenant_id,
                            'SK': f'producto#{codigo_producto}'
                        }
                    )
                    
                    if 'Item' not in producto_response:
                        mensaje = {
                            'error': f'Producto {codigo_producto} no encontrado'
                        }
                        return {
                            'statusCode': 404,
                            'body': mensaje
                        }
                    
                    producto = producto_response['Item']
                    
                    # Verificar stock disponible
                    if producto['stock'] < cantidad:
                        mensaje = {
                            'error': f'Stock insuficiente para producto {codigo_producto}'
                        }
                        return {
                            'statusCode': 400,
                            'body': mensaje
                        }
                    
                    # Calcular subtotal
                    subtotal = producto['precio'] * cantidad
                    total_compra += subtotal
                    
                    productos_validados.append({
                        'codigo': codigo_producto,
                        'nombre': producto['nombre'],
                        'precio_unitario': producto['precio'],
                        'cantidad': cantidad,
                        'subtotal': subtotal
                    })
                    
                except ClientError as e:
                    print(f"Error al buscar producto {codigo_producto}: {e}")
                    mensaje = {
                        'error': 'Error al validar productos'
                    }
                    return {
                        'statusCode': 500,
                        'body': mensaje
                    }
            compra_id = str(uuid.uuid4())
            timestamp = datetime.now().isoformat()
            
            # Crear claves primarias según nueva estructura
            pk = f"{tenant_id}#{usuario_id}"  # PK = tenant_id#usuario_id
            sk = f"compra#{compra_id}"        # SK = compra#<compra_id>
            
            # Crear objeto compra
            compra = {
                'PK': pk,                     # tenant_id#usuario_id
                'SK': sk,                     # compra#<compra_id>
                'compra_id': compra_id,
                'usuario_id': usuario_id,
                'tenant_id': tenant_id,
                'productos': productos_validados,
                'total': total_compra,
                'direccion_entrega': direccion_entrega,
                'metodo_pago': metodo_pago,
                'estado': 'confirmada',
                'created_at': timestamp,
                'updated_at': timestamp
            }
            
            # Almacenar compra en DynamoDB
            t_compras.put_item(Item=compra)
            
            # Actualizar stock de productos
            for item in productos:
                codigo_producto = item.get('codigo')
                cantidad = item.get('cantidad', 1)
                try:
                    t_productos.update_item(
                        Key={
                            'PK': tenant_id,
                            'SK': f'producto#{codigo_producto}'
                        },
                        UpdateExpression='SET stock = stock - :cantidad, updated_at = :timestamp',
                        ExpressionAttributeValues={
                            ':cantidad': cantidad,
                            ':timestamp': timestamp
                        }
                    )
                except ClientError as e:
                    print(f"Error al actualizar stock del producto {codigo_producto}: {e}")
                    # En un escenario real, aquí implementarías rollback
            
            # Retornar un código de estado HTTP 201 (Created) y un mensaje de éxito
            mensaje = {
                'message': 'Compra creada exitosamente',
                'compra_id': compra_id,
                'total': total_compra,
                'productos': productos_validados,
                'estado': 'confirmada',
                'created_at': timestamp
            }
            return {
                'statusCode': 201,
                'body': mensaje
            }
        else:
            mensaje = {
                'error': 'Campos requeridos: productos, direccion_entrega, metodo_pago'
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
