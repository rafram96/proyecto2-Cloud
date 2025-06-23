import json
import boto3
import os
from datetime import datetime

# Cliente de Elasticsearch
def get_elasticsearch_client():
    """
    Retorna cliente de Elasticsearch
    En un ambiente real, usarías AWS Elasticsearch Service
    """
    # Para este ejemplo, simulamos la conexión
    return boto3.client('es', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Función que actualiza Elasticsearch cuando hay cambios en productos
def lambda_handler(event, context):
    try:
        print("DynamoDB Stream Event:", json.dumps(event))
        
        # Procesar cada record del stream
        for record in event['Records']:
            event_name = record['eventName']  # INSERT, MODIFY, REMOVE
            
            # Solo procesar INSERT y MODIFY
            if event_name in ['INSERT', 'MODIFY']:
                # Obtener datos del producto desde DynamoDB Stream
                if 'NewImage' in record['dynamodb']:
                    new_image = record['dynamodb']['NewImage']
                    
                    # Convertir DynamoDB format a Python dict
                    producto = {}
                    for key, value in new_image.items():
                        if 'S' in value:  # String
                            producto[key] = value['S']
                        elif 'N' in value:  # Number
                            producto[key] = float(value['N'])
                        elif 'BOOL' in value:  # Boolean
                            producto[key] = value['BOOL']
                        elif 'L' in value:  # List
                            producto[key] = [item.get('S', item.get('N', '')) for item in value['L']]
                    
                    # Verificar que el producto esté activo
                    if producto.get('activo', False):
                        # Preparar documento para Elasticsearch
                        documento = {
                            'codigo': producto.get('codigo'),
                            'tenant_id': producto.get('tenant_id'),
                            'nombre': producto.get('nombre'),
                            'descripcion': producto.get('descripcion'),
                            'precio': producto.get('precio'),
                            'categoria': producto.get('categoria'),
                            'stock': producto.get('stock'),
                            'imagen_url': producto.get('imagen_url', ''),
                            'tags': producto.get('tags', []),
                            'created_at': producto.get('created_at'),
                            'updated_at': producto.get('updated_at'),
                            'indexed_at': datetime.now().isoformat()
                        }
                        
                        # Crear nombre del índice por tenant (multi-tenancy)
                        index_name = f"productos_{producto.get('tenant_id')}"
                        
                        try:
                            # En un ambiente real, aquí indexarías en Elasticsearch
                            # Para este ejemplo, simulamos la operación
                            print(f"Indexando producto en Elasticsearch:")
                            print(f"Index: {index_name}")
                            print(f"Documento: {json.dumps(documento, indent=2)}")
                            
                            # Simular respuesta exitosa de Elasticsearch
                            resultado = {
                                'index': index_name,
                                'id': producto.get('codigo'),
                                'result': 'created' if event_name == 'INSERT' else 'updated',
                                'successful': True
                            }
                            
                            print(f"Producto indexado exitosamente: {resultado}")
                            
                        except Exception as es_error:
                            print(f"Error al indexar en Elasticsearch: {es_error}")
                            # En un ambiente real, aquí podrías implementar retry logic
                            # o enviar a DLQ (Dead Letter Queue)
                            continue
            
            elif event_name == 'REMOVE':
                # Manejar eliminación de producto
                if 'OldImage' in record['dynamodb']:
                    old_image = record['dynamodb']['OldImage']
                    codigo = old_image.get('codigo', {}).get('S')
                    tenant_id = old_image.get('tenant_id', {}).get('S')
                    
                    if codigo and tenant_id:
                        index_name = f"productos_{tenant_id}"
                        
                        try:
                            # En un ambiente real, eliminarías el documento de Elasticsearch
                            print(f"Eliminando producto de Elasticsearch:")
                            print(f"Index: {index_name}, ID: {codigo}")
                            
                            # Simular eliminación exitosa
                            resultado = {
                                'index': index_name,
                                'id': codigo,
                                'result': 'deleted',
                                'successful': True
                            }
                            
                            print(f"Producto eliminado exitosamente: {resultado}")
                            
                        except Exception as es_error:
                            print(f"Error al eliminar de Elasticsearch: {es_error}")
                            continue
        
        return {
            'statusCode': 200,
            'body': {
                'message': 'Productos procesados exitosamente en Elasticsearch',
                'records_processed': len(event['Records'])
            }
        }
        
    except Exception as e:
        # Excepción y retornar un código de error HTTP 500
        print("Exception:", str(e))
        return {
            'statusCode': 500,
            'body': {
                'error': str(e)
            }
        }
