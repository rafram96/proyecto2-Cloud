import json
import boto3
import os
from datetime import datetime

# Cliente S3
s3_client = boto3.client('s3')

# Función que guarda compras en S3 cuando hay cambios en la tabla de compras
def lambda_handler(event, context):
    try:
        print("DynamoDB Stream Event:", json.dumps(event))
        
        # Nombre del bucket S3 desde variable de entorno
        bucket_name = os.environ.get('S3_BUCKET_NAME', 'tienda-electronicos-data')
        
        # Procesar cada record del stream
        for record in event['Records']:
            event_name = record['eventName']  # INSERT, MODIFY, REMOVE
            
            # Solo procesar INSERT (nuevas compras)
            if event_name == 'INSERT':
                # Obtener datos de la compra desde DynamoDB Stream
                if 'NewImage' in record['dynamodb']:
                    new_image = record['dynamodb']['NewImage']
                    
                    # Convertir DynamoDB format a Python dict
                    compra = {}
                    for key, value in new_image.items():
                        if 'S' in value:  # String
                            compra[key] = value['S']
                        elif 'N' in value:  # Number
                            compra[key] = float(value['N'])
                        elif 'BOOL' in value:  # Boolean
                            compra[key] = value['BOOL']
                        elif 'L' in value:  # List
                            # Manejar lista de productos
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
                            else:
                                compra[key] = [item.get('S', item.get('N', '')) for item in value['L']]
                    
                    # Preparar datos para S3 y Glue Catalog
                    tenant_id = compra.get('tenant_id')
                    compra_id = compra.get('compra_id')
                    created_at = compra.get('created_at')
                    
                    if tenant_id and compra_id:
                        # Estructura de partición por tenant y fecha
                        fecha = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                        year = fecha.strftime('%Y')
                        month = fecha.strftime('%m')
                        day = fecha.strftime('%d')
                        
                        # Crear estructura de carpetas: tenant_id/year/month/day/
                        s3_key = f"compras/tenant_id={tenant_id}/year={year}/month={month}/day={day}/{compra_id}.json"
                        
                        # Preparar documento JSON para S3
                        documento_s3 = {
                            'compra_id': compra.get('compra_id'),
                            'usuario_id': compra.get('usuario_id'),
                            'tenant_id': compra.get('tenant_id'),
                            'productos': compra.get('productos', []),
                            'total': compra.get('total'),
                            'direccion_entrega': compra.get('direccion_entrega'),
                            'metodo_pago': compra.get('metodo_pago'),
                            'estado': compra.get('estado'),
                            'created_at': compra.get('created_at'),
                            'updated_at': compra.get('updated_at'),
                            'processed_at': datetime.now().isoformat()
                        }
                        
                        try:
                            # Guardar en S3
                            s3_response = s3_client.put_object(
                                Bucket=bucket_name,
                                Key=s3_key,
                                Body=json.dumps(documento_s3, ensure_ascii=False, indent=2),
                                ContentType='application/json'
                            )
                            
                            print(f"Compra guardada en S3:")
                            print(f"Bucket: {bucket_name}")
                            print(f"Key: {s3_key}")
                            print(f"Response: {s3_response}")
                            
                            # También crear versión CSV para análisis
                            csv_key = f"compras-csv/tenant_id={tenant_id}/year={year}/month={month}/day={day}/{compra_id}.csv"
                            
                            # Crear línea CSV
                            csv_header = "compra_id,usuario_id,tenant_id,total,metodo_pago,estado,created_at,num_productos\n"
                            csv_line = f"{compra.get('compra_id')},{compra.get('usuario_id')},{compra.get('tenant_id')},{compra.get('total')},{compra.get('metodo_pago')},{compra.get('estado')},{compra.get('created_at')},{len(compra.get('productos', []))}\n"
                            
                            csv_content = csv_header + csv_line
                            
                            # Guardar CSV en S3
                            s3_csv_response = s3_client.put_object(
                                Bucket=bucket_name,
                                Key=csv_key,
                                Body=csv_content,
                                ContentType='text/csv'
                            )
                            
                            print(f"CSV guardado en S3:")
                            print(f"Key: {csv_key}")
                            
                        except Exception as s3_error:
                            print(f"Error al guardar en S3: {s3_error}")
                            # En un ambiente real, aquí podrías implementar retry logic
                            continue
        
        return {
            'statusCode': 200,
            'body': {
                'message': 'Compras procesadas exitosamente en S3',
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
