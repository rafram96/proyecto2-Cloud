import json
import boto3
import os
from datetime import datetime

# Cliente S3
s3_client = boto3.client('s3')
glue_client = boto3.client('glue')

def lambda_handler(event, context):
    try:
        # Nombre del bucket S3
        bucket_name = os.environ['S3_BUCKET_NAME']
        
        # Procesar cada record del stream
        for record in event['Records']:
            event_name = record['eventName']  # INSERT, MODIFY, REMOVE
            
            # Solo procesar INSERT (nuevas compras)
            if event_name == 'INSERT':
                if 'NewImage' in record['dynamodb']:
                    new_image = record['dynamodb']['NewImage']
                    
                    # Convertir DynamoDB format a Python dict
                    compra = {}
                    for key, value in new_image.items():
                        if 'S' in value:  # String
                            compra[key] = value['S']
                        elif 'N' in value:  # Number
                            compra[key] = float(value['N'])
                        elif 'L' in value:  # List
                            if key == 'productos':
                                productos_list = []
                                for item in value['L']:
                                    if 'M' in item:  # Map (objeto)
                                        producto_obj = {}
                                        for prod_key, prod_value in item['M'].items():
                                            if 'S' in prod_value:
                                                producto_obj[prod_key] = prod_value['S']
                                            elif 'N' in prod_value:
                                                producto_obj[prod_key] = float(prod_value['N'])
                                        productos_list.append(producto_obj)
                                compra[key] = productos_list
                    
                    # Preparar datos para S3
                    tenant_id = compra.get('tenant_id')
                    compra_id = compra.get('compra_id')
                    created_at = compra.get('created_at')
                    
                    if tenant_id and compra_id and created_at:
                        # Estructura de partición por fecha
                        fecha = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                        year = fecha.strftime('%Y')
                        month = fecha.strftime('%m')
                        day = fecha.strftime('%d')
                        
                        # Ruta en S3
                        s3_key = f"compras/tenant_id={tenant_id}/year={year}/month={month}/day={day}/{compra_id}.json"
                        
                        # Guardar en S3
                        s3_client.put_object(
                            Bucket=bucket_name,
                            Key=s3_key,
                            Body=json.dumps(compra),
                            ContentType='application/json'
                        )
        
        # Crear/actualizar catálogo de datos en Glue
        update_glue_catalog(bucket_name)
        
        return {
            'statusCode': 200,
            'body': json.dumps('Compras procesadas exitosamente en S3')
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(str(e))
        }

def update_glue_catalog(bucket_name):
    """Actualiza el catálogo de datos en AWS Glue"""
    try:
        database_name = "compras_catalog"
        table_name = "compras"
        
        # Crear base de datos si no existe
        try:
            glue_client.create_database(
                DatabaseInput={
                    'Name': database_name
                }
            )
        except glue_client.exceptions.AlreadyExistsException:
            pass
        
        # Definir esquema de la tabla
        table_input = {
            'Name': table_name,
            'TableType': 'EXTERNAL_TABLE',
            'StorageDescriptor': {
                'Columns': [
                    {'Name': 'compra_id', 'Type': 'string'},
                    {'Name': 'usuario_id', 'Type': 'string'},
                    {'Name': 'tenant_id', 'Type': 'string'},
                    {'Name': 'productos', 'Type': 'array<struct<producto_id:string,precio:double,cantidad:int>>'},
                    {'Name': 'total', 'Type': 'double'},
                    {'Name': 'created_at', 'Type': 'string'}
                ],
                'Location': f"s3://{bucket_name}/compras/",
                'InputFormat': 'org.apache.hadoop.mapred.TextInputFormat',
                'OutputFormat': 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat',
                'SerdeInfo': {
                    'SerializationLibrary': 'org.openx.data.jsonserde.JsonSerDe'
                },
                'PartitionKeys': [
                    {'Name': 'tenant_id', 'Type': 'string'},
                    {'Name': 'year', 'Type': 'string'},
                    {'Name': 'month', 'Type': 'string'},
                    {'Name': 'day', 'Type': 'string'}
                ]
            },
            'PartitionKeys': [
                {'Name': 'tenant_id', 'Type': 'string'},
                {'Name': 'year', 'Type': 'string'},
                {'Name': 'month', 'Type': 'string'},
                {'Name': 'day', 'Type': 'string'}
            ],
            'Parameters': {
                'classification': 'json',
                'projection.enabled': 'true',
                'projection.tenant_id.type': 'injected',
                'projection.year.type': 'injected',
                'projection.month.type': 'injected',
                'projection.day.type': 'injected'
            }
        }
        
        # Crear o actualizar tabla
        try:
            glue_client.create_table(
                DatabaseName=database_name,
                TableInput=table_input
            )
        except glue_client.exceptions.AlreadyExistsException:
            glue_client.update_table(
                DatabaseName=database_name,
                TableInput=table_input
            )
            
    except Exception as e:
        print(f"Error actualizando Glue Catalog: {str(e)}")