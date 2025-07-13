import json
import os
import uuid
import boto3
from datetime import datetime
from botocore.exceptions import ClientError
from decimal import Decimal

# Importar utilidades
import sys
sys.path.append('/opt/python')
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'utils'))

from auth import require_auth, create_response, get_tenant_id, get_user_id
from dynamodb import get_compras_table

def lambda_handler(event, context):
    @require_auth
    def _handler(event, context):
        try:
            # Obtener contexto del usuario desde JWT
            tenant_id = get_tenant_id(event)
            user_id = get_user_id(event)
            
            if not tenant_id or not user_id:
                return create_response(400, {
                    'success': False, 
                    'error': 'Información de usuario inválida'
                })

            # Parse del body de la request
            if isinstance(event.get('body'), str):
                body = json.loads(event['body'])
            else:
                body = event.get('body', {})

            # Validar campos requeridos
            productos = body.get('productos', [])
            direccion_entrega = body.get('direccion_entrega')
            metodo_pago = body.get('metodo_pago')

            if not productos or not direccion_entrega or not metodo_pago:
                return create_response(400, {
                    'success': False,
                    'error': 'Campos requeridos: productos, direccion_entrega, metodo_pago'
                })

            if not isinstance(productos, list) or len(productos) == 0:
                return create_response(400, {
                    'success': False,
                    'error': 'Debe incluir al menos un producto en la compra'
                })

            # Conectar a DynamoDB
            dynamodb = boto3.resource('dynamodb')
            compras_table = get_compras_table()
            productos_table = dynamodb.Table(os.environ.get('PRODUCTOS_TABLE', 'productos-dev'))

            # Validar productos y calcular total
            total_compra = Decimal('0')
            productos_validados = []

            for item in productos:
                codigo_producto = item.get('codigo')
                cantidad = item.get('cantidad', 1)

                if not codigo_producto or cantidad <= 0:
                    return create_response(400, {
                        'success': False,
                        'error': 'Código de producto y cantidad válida requeridos'
                    })

                # Buscar producto en la tabla de productos
                try:
                    producto_response = productos_table.get_item(
                        Key={
                            'tenant_id': tenant_id,
                            'SK': f'PRODUCTO#{codigo_producto}'
                        }
                    )

                    if 'Item' not in producto_response:
                        return create_response(404, {
                            'success': False,
                            'error': f'Producto {codigo_producto} no encontrado'
                        })

                    producto = producto_response['Item']

                    # Verificar stock disponible
                    stock_disponible = int(producto.get('stock', 0))
                    if stock_disponible < cantidad:
                        return create_response(400, {
                            'success': False,
                            'error': f'Stock insuficiente para producto {codigo_producto}. Disponible: {stock_disponible}'
                        })

                    # Calcular subtotal
                    precio_unitario = Decimal(str(producto['precio']))
                    subtotal = precio_unitario * Decimal(str(cantidad))
                    total_compra += subtotal

                    productos_validados.append({
                        'codigo': codigo_producto,
                        'nombre': producto['nombre'],
                        'precio_unitario': precio_unitario,
                        'cantidad': cantidad,
                        'subtotal': subtotal
                    })

                except ClientError as e:
                    print(f"Error al buscar producto {codigo_producto}: {e}")
                    return create_response(500, {
                        'success': False,
                        'error': 'Error al validar productos'
                    })

            # Crear la compra
            compra_id = str(uuid.uuid4())
            timestamp = datetime.utcnow().isoformat()

            compra_item = {
                'tenant_id': tenant_id,
                'SK': f'COMPRA#{compra_id}',
                'compra_id': compra_id,
                'user_id': user_id,
                'fecha_compra': timestamp,
                'productos': productos_validados,
                'total': total_compra,
                'direccion_entrega': direccion_entrega,
                'metodo_pago': metodo_pago,
                'estado': 'COMPLETADA',
                'created_at': timestamp,
                'updated_at': timestamp
            }

            # Guardar compra en DynamoDB
            compras_table.put_item(Item=compra_item)

            # Actualizar stock de productos
            for item in productos:
                codigo_producto = item.get('codigo')
                cantidad = item.get('cantidad', 1)
                
                try:
                    productos_table.update_item(
                        Key={
                            'tenant_id': tenant_id,
                            'SK': f'PRODUCTO#{codigo_producto}'
                        },
                        UpdateExpression='SET stock = stock - :cantidad, updated_at = :timestamp',
                        ExpressionAttributeValues={
                            ':cantidad': cantidad,
                            ':timestamp': timestamp
                        }
                    )
                except ClientError as e:
                    print(f"Error al actualizar stock del producto {codigo_producto}: {e}")
                    # En un escenario real, implementarías rollback aquí

            return create_response(201, {
                'success': True,
                'message': 'Compra creada exitosamente',
                'data': {
                    'compra_id': compra_id,
                    'total': float(total_compra), 
                    'productos': [
                        {
                            **prod,
                            'precio_unitario': float(prod['precio_unitario']),
                            'subtotal': float(prod['subtotal'])
                        } for prod in productos_validados
                    ],
                    'estado': 'COMPLETADA',
                    'created_at': timestamp
                }
            })

        except json.JSONDecodeError:
            return create_response(400, {
                'success': False,
                'error': 'JSON inválido'
            })
        except Exception as e:
            print(f"Error interno: {e}")
            return create_response(500, {
                'success': False,
                'error': 'Error interno del servidor'
            })

    return _handler(event, context)
