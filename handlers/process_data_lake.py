"""
Lambda para procesar archivos subidos al Data Lake
Actualiza automáticamente las particiones de Glue cuando se suben nuevos archivos
"""

import json
import boto3
import urllib.parse
from datetime import datetime

# Inicializar clientes AWS
glue_client = boto3.client('glue')
s3_client = boto3.client('s3')

def lambda_handler(event, context):
    """
    Handler principal para procesar archivos del Data Lake
    Se ejecuta cuando se sube un nuevo archivo a S3
    """
    
    try:
        print("Event recibido:", json.dumps(event))
        
        # Procesar cada registro del evento S3
        for record in event['Records']:
            # Extraer información del archivo
            bucket_name = record['s3']['bucket']['name']
            object_key = urllib.parse.unquote_plus(record['s3']['object']['key'])
            
            print(f"Procesando archivo: s3://{bucket_name}/{object_key}")
            
            # Determinar tipo de archivo y procesar
            if object_key.startswith('compras/'):
                process_compras_file(bucket_name, object_key)
            elif object_key.startswith('productos/'):
                process_productos_file(bucket_name, object_key)
            else:
                print(f"Tipo de archivo no reconocido: {object_key}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Archivos procesados exitosamente',
                'processedFiles': len(event['Records'])
            })
        }
        
    except Exception as e:
        print(f"Error procesando archivos: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': 'Error procesando archivos del Data Lake',
                'details': str(e)
            })
        }

def process_compras_file(bucket_name, object_key):
    """
    Procesa archivos de compras y actualiza particiones de Glue
    """
    try:
        # Extraer información de la partición del path
        # Formato esperado: compras/year=2024/month=06/day=12/file.csv
        parts = object_key.split('/')
        
        if len(parts) >= 4:
            year_part = parts[1]  # year=2024
            month_part = parts[2]  # month=06
            day_part = parts[3]   # day=12
            
            # Extraer valores
            year = year_part.split('=')[1] if '=' in year_part else '2024'
            month = month_part.split('=')[1] if '=' in month_part else '01'
            day = day_part.split('=')[1] if '=' in day_part else '01'
            
            # Crear partición si no existe
            create_partition_if_not_exists(
                database_name=get_database_name(),
                table_name='compras_csv',
                partition_values=[year, month, day],
                location=f"s3://{bucket_name}/compras/year={year}/month={month}/day={day}/"
            )
            
            print(f"Partición creada/actualizada para compras: year={year}/month={month}/day={day}")
        else:
            print(f"Path de archivo no sigue formato de partición esperado: {object_key}")
            
    except Exception as e:
        print(f"Error procesando archivo de compras {object_key}: {str(e)}")

def process_productos_file(bucket_name, object_key):
    """
    Procesa archivos de productos (para futura expansión)
    """
    try:
        print(f"Procesando archivo de productos: {object_key}")
        # Implementar lógica para productos si es necesario
        
    except Exception as e:
        print(f"Error procesando archivo de productos {object_key}: {str(e)}")

def create_partition_if_not_exists(database_name, table_name, partition_values, location):
    """
    Crea una partición en Glue si no existe
    """
    try:
        # Verificar si la partición ya existe
        try:
            glue_client.get_partition(
                DatabaseName=database_name,
                TableName=table_name,
                PartitionValues=partition_values
            )
            print(f"Partición ya existe: {partition_values}")
            return
            
        except glue_client.exceptions.EntityNotFoundException:
            # La partición no existe, crearla
            pass
        
        # Crear nueva partición
        partition_input = {
            'Values': partition_values,
            'StorageDescriptor': {
                'Columns': [
                    {'Name': 'id_compra', 'Type': 'string'},
                    {'Name': 'tenant_id', 'Type': 'string'},
                    {'Name': 'email_usuario', 'Type': 'string'},
                    {'Name': 'productos', 'Type': 'string'},
                    {'Name': 'total', 'Type': 'double'},
                    {'Name': 'fecha_compra', 'Type': 'timestamp'},
                    {'Name': 'estado', 'Type': 'string'}
                ],
                'Location': location,
                'InputFormat': 'org.apache.hadoop.mapred.TextInputFormat',
                'OutputFormat': 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat',
                'SerdeInfo': {
                    'SerializationLibrary': 'org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe',
                    'Parameters': {
                        'field.delim': ',',
                        'skip.header.line.count': '1'
                    }
                }
            }
        }
        
        glue_client.create_partition(
            DatabaseName=database_name,
            TableName=table_name,
            PartitionInput=partition_input
        )
        
        print(f"Partición creada exitosamente: {partition_values}")
        
    except Exception as e:
        print(f"Error creando partición: {str(e)}")

def get_database_name():
    """
    Obtiene el nombre de la base de datos Glue desde variables de entorno
    """
    import os
    
    project_name = os.getenv('PROJECT_NAME', 'tienda-electronicos')
    stage = os.getenv('STAGE', 'dev')
    
    return f"{project_name}_{stage}"
