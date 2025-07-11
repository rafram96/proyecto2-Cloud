import json
import boto3
import os
import csv
from datetime import datetime
from io import StringIO

# Configuración de S3
s3_client = boto3.client('s3')
BUCKET_NAME = os.environ.get('COMPRAS_BUCKET', 'compras-data-dev')

def lambda_handler(event, context):
    """
    Handler para procesar cambios en DynamoDB Streams de compras
    Exporta los datos como CSV/JSON a S3 para análisis con Athena
    """
    try:
        print(f"Processing {len(event['Records'])} records")
        
        for record in event['Records']:
            # Solo procesar eventos INSERT y MODIFY
            if record['eventName'] in ['INSERT', 'MODIFY']:
                process_compra_record(record)
        
        return {
            'statusCode': 200,
            'body': json.dumps('Successfully processed all records')
        }
    
    except Exception as e:
        print(f"Error processing stream records: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        }

def process_compra_record(record):
    """Procesa un registro individual de compra"""
    try:
        # Obtener datos del registro
        if record['eventName'] == 'INSERT':
            compra_data = record['dynamodb']['NewImage']
        else:  # MODIFY
            compra_data = record['dynamodb']['NewImage']
        
        # Convertir datos de DynamoDB a formato Python
        compra = convert_dynamodb_to_python(compra_data)
        
        # Solo procesar si es un registro de compra
        if compra.get('SK', '').startswith('COMPRA#'):
            # Exportar como JSON
            export_to_json(compra)
            
            # Exportar como CSV
            export_to_csv(compra)
            
            print(f"Exported compra {compra.get('compra_id')} to S3")
    
    except Exception as e:
        print(f"Error processing individual record: {e}")

def convert_dynamodb_to_python(item):
    """Convierte un item de DynamoDB al formato Python estándar"""
    def convert_value(value):
        if 'S' in value:
            return value['S']
        elif 'N' in value:
            return float(value['N']) if '.' in value['N'] else int(value['N'])
        elif 'BOOL' in value:
            return value['BOOL']
        elif 'L' in value:
            return [convert_value(v) for v in value['L']]
        elif 'M' in value:
            return {k: convert_value(v) for k, v in value['M'].items()}
        elif 'NULL' in value:
            return None
        else:
            return value
    
    return {k: convert_value(v) for k, v in item.items()}

def export_to_json(compra):
    """Exporta compra como archivo JSON a S3"""
    try:
        tenant_id = compra.get('tenant_id')
        compra_id = compra.get('compra_id')
        fecha = datetime.now().strftime('%Y/%m/%d')
        
        # Crear estructura de carpetas por tenant y fecha
        key = f"json/{tenant_id}/{fecha}/compra_{compra_id}.json"
        
        # Preparar datos para export
        export_data = {
            'compra_id': compra_id,
            'tenant_id': tenant_id,
            'user_id': compra.get('user_id'),
            'fecha_compra': compra.get('fecha_compra'),
            'total': compra.get('total'),
            'estado': compra.get('estado'),
            'metodo_pago': compra.get('metodo_pago'),
            'direccion_entrega': compra.get('direccion_entrega'),
            'cantidad_productos': len(compra.get('productos', [])),
            'productos': compra.get('productos', []),
            'exported_at': datetime.utcnow().isoformat()
        }
        
        # Subir a S3
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=key,
            Body=json.dumps(export_data, ensure_ascii=False, indent=2),
            ContentType='application/json'
        )
        
    except Exception as e:
        print(f"Error exporting JSON: {e}")

def export_to_csv(compra):
    """Exporta compra como registro CSV a S3"""
    try:
        tenant_id = compra.get('tenant_id')
        fecha = datetime.now().strftime('%Y/%m/%d')
        
        # Crear estructura de carpetas por tenant y fecha
        key = f"csv/{tenant_id}/{fecha}/compras.csv"
        
        # Crear fila CSV
        csv_data = {
            'compra_id': compra.get('compra_id'),
            'tenant_id': tenant_id,
            'user_id': compra.get('user_id'),
            'fecha_compra': compra.get('fecha_compra'),
            'total': compra.get('total'),
            'estado': compra.get('estado'),
            'metodo_pago': compra.get('metodo_pago'),
            'direccion_entrega': compra.get('direccion_entrega'),
            'cantidad_productos': len(compra.get('productos', [])),
            'exported_at': datetime.utcnow().isoformat()
        }
        
        # Verificar si el archivo ya existe para agregar header
        file_exists = True
        try:
            s3_client.head_object(Bucket=BUCKET_NAME, Key=key)
        except:
            file_exists = False
        
        # Crear CSV string
        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=csv_data.keys())
        
        # Agregar header solo si es un archivo nuevo
        if not file_exists:
            writer.writeheader()
        
        writer.writerow(csv_data)
        csv_content = output.getvalue()
        
        if file_exists:
            # Append al archivo existente
            try:
                # Obtener contenido existente
                response = s3_client.get_object(Bucket=BUCKET_NAME, Key=key)
                existing_content = response['Body'].read().decode('utf-8')
                
                # Combinar contenido
                new_content = existing_content + csv_content
            except:
                new_content = csv_content
        else:
            new_content = csv_content
        
        # Subir archivo actualizado
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=key,
            Body=new_content,
            ContentType='text/csv'
        )
        
    except Exception as e:
        print(f"Error exporting CSV: {e}")

def export_productos_detail(compra):
    """Exporta detalle de productos como CSV separado para análisis"""
    try:
        tenant_id = compra.get('tenant_id')
        compra_id = compra.get('compra_id')
        fecha = datetime.now().strftime('%Y/%m/%d')
        
        # Crear estructura de carpetas por tenant y fecha
        key = f"csv/{tenant_id}/{fecha}/productos_detalle.csv"
        
        productos = compra.get('productos', [])
        if not productos:
            return
        
        # Crear registros para cada producto
        rows = []
        for producto in productos:
            row = {
                'compra_id': compra_id,
                'tenant_id': tenant_id,
                'user_id': compra.get('user_id'),
                'fecha_compra': compra.get('fecha_compra'),
                'producto_codigo': producto.get('codigo'),
                'producto_nombre': producto.get('nombre'),
                'precio_unitario': producto.get('precio_unitario'),
                'cantidad': producto.get('cantidad'),
                'subtotal': producto.get('subtotal'),
                'exported_at': datetime.utcnow().isoformat()
            }
            rows.append(row)
        
        # Verificar si el archivo ya existe
        file_exists = True
        try:
            s3_client.head_object(Bucket=BUCKET_NAME, Key=key)
        except:
            file_exists = False
        
        # Crear CSV string
        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=rows[0].keys())
        
        if not file_exists:
            writer.writeheader()
        
        writer.writerows(rows)
        csv_content = output.getvalue()
        
        if file_exists:
            try:
                response = s3_client.get_object(Bucket=BUCKET_NAME, Key=key)
                existing_content = response['Body'].read().decode('utf-8')
                new_content = existing_content + csv_content
            except:
                new_content = csv_content
        else:
            new_content = csv_content
        
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=key,
            Body=new_content,
            ContentType='text/csv'
        )
        
    except Exception as e:
        print(f"Error exporting productos detail: {e}")
