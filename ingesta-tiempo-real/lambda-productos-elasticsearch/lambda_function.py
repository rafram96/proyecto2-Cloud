import json
import boto3
import os
from datetime import datetime
from elasticsearch import Elasticsearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth
import logging

# Configurar logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def get_elasticsearch_client():
    """
    Retorna cliente de Elasticsearch conectado a AWS OpenSearch Service
    """
    try:
        # Configuración de AWS OpenSearch
        host = os.environ.get('ELASTICSEARCH_ENDPOINT')
        region = os.environ.get('AWS_REGION', 'us-east-1')
        
        if not host:
            logger.error("ELASTICSEARCH_ENDPOINT no configurado")
            raise ValueError("ELASTICSEARCH_ENDPOINT requerido")
        
        # Autenticación AWS4Auth para OpenSearch
        credentials = boto3.Session().get_credentials()
        awsauth = AWS4Auth(
            credentials.access_key,
            credentials.secret_key,
            region,
            'es',
            session_token=credentials.token
        )
        
        # Cliente Elasticsearch
        es_client = Elasticsearch(
            hosts=[{'host': host, 'port': 443}],
            http_auth=awsauth,
            use_ssl=True,
            verify_certs=True,
            connection_class=RequestsHttpConnection,
            timeout=30,
            max_retries=3,
            retry_on_timeout=True
        )
        
        # Verificar conexión
        if es_client.ping():
            logger.info("Conexión exitosa a Elasticsearch")
            return es_client
        else:
            raise ConnectionError("No se pudo conectar a Elasticsearch")
            
    except Exception as e:
        logger.error(f"Error al conectar con Elasticsearch: {e}")
        raise

def create_index_mapping(es_client, index_name):
    """
    Crea el mapping del índice de productos con configuración optimizada para búsqueda
    """
    mapping = {
        "settings": {
            "number_of_shards": 1,
            "number_of_replicas": 1,
            "analysis": {
                "analyzer": {
                    "producto_analyzer": {
                        "type": "custom",
                        "tokenizer": "standard",
                        "filter": [
                            "lowercase",
                            "spanish_stop",
                            "spanish_stemmer",
                            "asciifolding"
                        ]
                    },
                    "autocomplete_analyzer": {
                        "type": "custom",
                        "tokenizer": "edge_ngram_tokenizer",
                        "filter": ["lowercase", "asciifolding"]
                    }
                },
                "tokenizer": {
                    "edge_ngram_tokenizer": {
                        "type": "edge_ngram",
                        "min_gram": 2,
                        "max_gram": 20,
                        "token_chars": ["letter", "digit"]
                    }
                },
                "filter": {
                    "spanish_stop": {
                        "type": "stop",
                        "stopwords": "_spanish_"
                    },
                    "spanish_stemmer": {
                        "type": "stemmer",
                        "language": "spanish"
                    }
                }
            }
        },
        "mappings": {
            "properties": {
                "codigo": {
                    "type": "keyword"
                },
                "tenant_id": {
                    "type": "keyword"
                },
                "nombre": {
                    "type": "text",
                    "analyzer": "producto_analyzer",
                    "fields": {
                        "autocomplete": {
                            "type": "text",
                            "analyzer": "autocomplete_analyzer"
                        },
                        "keyword": {
                            "type": "keyword"
                        }
                    }
                },
                "descripcion": {
                    "type": "text",
                    "analyzer": "producto_analyzer"
                },
                "precio": {
                    "type": "double"
                },
                "categoria": {
                    "type": "keyword",
                    "fields": {
                        "text": {
                            "type": "text",
                            "analyzer": "producto_analyzer"
                        }
                    }
                },
                "stock": {
                    "type": "integer"
                },
                "imagen_url": {
                    "type": "keyword",
                    "index": False
                },
                "tags": {
                    "type": "keyword"
                },
                "activo": {
                    "type": "boolean"
                },
                "created_at": {
                    "type": "date",
                    "format": "strict_date_optional_time||epoch_millis"
                },
                "updated_at": {
                    "type": "date",
                    "format": "strict_date_optional_time||epoch_millis"
                },
                "indexed_at": {
                    "type": "date",
                    "format": "strict_date_optional_time||epoch_millis"
                },
                "suggest": {
                    "type": "completion",
                    "analyzer": "producto_analyzer",
                    "contexts": [
                        {
                            "name": "tenant_context",
                            "type": "category"
                        }
                    ]
                }
            }
        }
    }
    
    try:
        # Verificar si el índice existe
        if not es_client.indices.exists(index=index_name):
            # Crear índice con mapping
            es_client.indices.create(index=index_name, body=mapping)
            logger.info(f"Índice creado: {index_name}")
        else:
            logger.info(f"Índice ya existe: {index_name}")
    except Exception as e:
        logger.error(f"Error al crear índice {index_name}: {e}")
        raise

def index_producto(es_client, index_name, producto, event_name):
    """
    Indexa un producto en Elasticsearch
    """
    try:
        # Preparar documento para indexación
        documento = {
            'codigo': producto.get('codigo'),
            'tenant_id': producto.get('tenant_id'),
            'nombre': producto.get('nombre'),
            'descripcion': producto.get('descripcion', ''),
            'precio': float(producto.get('precio', 0)),
            'categoria': producto.get('categoria'),
            'stock': int(producto.get('stock', 0)),
            'imagen_url': producto.get('imagen_url', ''),
            'tags': producto.get('tags', []),
            'activo': producto.get('activo', True),
            'created_at': producto.get('created_at'),
            'updated_at': producto.get('updated_at'),
            'indexed_at': datetime.now().isoformat(),
            # Campo para autocompletado contextual
            'suggest': {
                'input': [
                    producto.get('nombre', ''),
                    producto.get('descripcion', '')[:100],  # Limitar descripción
                    *producto.get('tags', [])
                ],
                'contexts': {
                    'tenant_context': [producto.get('tenant_id')]
                }
            }
        }
        
        # Indexar documento
        response = es_client.index(
            index=index_name,
            id=producto.get('codigo'),
            body=documento,
            refresh='wait_for'  # Esperar que el documento esté disponible para búsqueda
        )
        
        logger.info(f"Producto indexado - Index: {index_name}, ID: {producto.get('codigo')}, Result: {response['result']}")
        return response
        
    except Exception as e:
        logger.error(f"Error al indexar producto {producto.get('codigo')}: {e}")
        raise

def delete_producto(es_client, index_name, codigo):
    """
    Elimina un producto de Elasticsearch
    """
    try:
        response = es_client.delete(
            index=index_name,
            id=codigo,
            refresh='wait_for'
        )
        logger.info(f"Producto eliminado - Index: {index_name}, ID: {codigo}")
        return response
    except Exception as e:
        if "not_found" in str(e).lower():
            logger.warning(f"Producto {codigo} no encontrado para eliminar")
            return {"result": "not_found"}
        else:
            logger.error(f"Error al eliminar producto {codigo}: {e}")
            raise

def lambda_handler(event, context):
    """
    Función principal que procesa eventos de DynamoDB Streams
    """
    try:
        logger.info(f"Procesando {len(event['Records'])} records de DynamoDB Stream")
        
        # Obtener cliente de Elasticsearch
        es_client = get_elasticsearch_client()
        
        resultados = []
        
        # Procesar cada record del stream
        for record in event['Records']:
            try:
                event_name = record['eventName']  # INSERT, MODIFY, REMOVE
                logger.info(f"Procesando evento: {event_name}")
                
                if event_name in ['INSERT', 'MODIFY']:
                    # Procesar inserción o modificación
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
                        
                        # Solo indexar productos activos
                        if producto.get('activo', False):
                            tenant_id = producto.get('tenant_id')
                            if tenant_id:
                                # Crear nombre del índice por tenant (multi-tenancy)
                                index_name = f"productos_{tenant_id.lower()}"
                                
                                # Crear índice si no existe
                                create_index_mapping(es_client, index_name)
                                
                                # Indexar producto
                                response = index_producto(es_client, index_name, producto, event_name)
                                resultados.append({
                                    'event': event_name,
                                    'producto_id': producto.get('codigo'),
                                    'result': response['result'],
                                    'successful': True
                                })
                            else:
                                logger.warning("Producto sin tenant_id, saltando...")
                        else:
                            logger.info(f"Producto {producto.get('codigo')} inactivo, no indexado")
                
                elif event_name == 'REMOVE':
                    # Procesar eliminación
                    if 'OldImage' in record['dynamodb']:
                        old_image = record['dynamodb']['OldImage']
                        codigo = old_image.get('codigo', {}).get('S')
                        tenant_id = old_image.get('tenant_id', {}).get('S')
                        
                        if codigo and tenant_id:
                            index_name = f"productos_{tenant_id.lower()}"
                            
                            # Eliminar producto de Elasticsearch
                            response = delete_producto(es_client, index_name, codigo)
                            resultados.append({
                                'event': event_name,
                                'producto_id': codigo,
                                'result': response.get('result', 'deleted'),
                                'successful': True
                            })
                        else:
                            logger.warning("Datos incompletos para eliminación")
            
            except Exception as record_error:
                logger.error(f"Error procesando record: {record_error}")
                resultados.append({
                    'event': record.get('eventName', 'unknown'),
                    'successful': False,
                    'error': str(record_error)
                })
                # Continuar procesando otros records
                continue
        
        # Resumen de resultados
        exitosos = len([r for r in resultados if r.get('successful')])
        errores = len(resultados) - exitosos
        
        logger.info(f"Procesamiento completado - Exitosos: {exitosos}, Errores: {errores}")
        
        return {
            'statusCode': 200,
            'body': {
                'message': 'Productos procesados exitosamente en Elasticsearch',
                'records_processed': len(event['Records']),
                'successful': exitosos,
                'errors': errores,
                'results': resultados
            }
        }
        
    except Exception as e:
        logger.error(f"Error crítico en lambda_handler: {e}")
        return {
            'statusCode': 500,
            'body': {
                'error': str(e),
                'message': 'Error procesando stream de productos'
            }
        }