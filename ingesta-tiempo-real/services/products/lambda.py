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

def transform_dynamo_item(dynamo_item):
    """Convierte el formato DynamoDB a un diccionario plano"""
    transformed = {}
    for key, value in dynamo_item.items():
        if 'S' in value:
            transformed[key] = value['S']
        elif 'N' in value:
            try:
                transformed[key] = float(value['N'])
            except ValueError:
                transformed[key] = value['N']
        elif 'BOOL' in value:
            transformed[key] = value['BOOL']
        elif 'L' in value:
            transformed[key] = [item.get('S', item.get('N', '')) for item in value['L']]
        elif 'M' in value:
            transformed[key] = transform_dynamo_item(value['M'])
    return transformed

def get_elasticsearch_client():
    """Retorna cliente de Elasticsearch conectado a AWS OpenSearch Service"""
    try:
        host = os.environ.get('ELASTICSEARCH_ENDPOINT')
        region = os.environ.get('AWS_REGION', 'us-east-1')
        
        if not host:
            logger.error("ELASTICSEARCH_ENDPOINT no configurado")
            raise ValueError("ELASTICSEARCH_ENDPOINT requerido")
        
        credentials = boto3.Session().get_credentials()
        awsauth = AWS4Auth(
            credentials.access_key,
            credentials.secret_key,
            region,
            'es',
            session_token=credentials.token
        )
        
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
        
        if es_client.ping():
            logger.info("Conexión exitosa a Elasticsearch")
            return es_client
        else:
            raise ConnectionError("No se pudo conectar a Elasticsearch")
            
    except Exception as e:
        logger.error(f"Error al conectar con Elasticsearch: {e}")
        raise

def create_index_mapping(es_client, index_name):
    """Crea el mapping del índice con configuración optimizada para búsqueda"""
    mapping = {
        "settings": {
            "number_of_shards": 1,
            "number_of_replicas": 1,
            "analysis": {
                "analyzer": {
                    "producto_analyzer": {
                        "type": "custom",
                        "tokenizer": "standard",
                        "filter": ["lowercase", "spanish_stop", "spanish_stemmer"]
                    },
                    "autocomplete_analyzer": {
                        "type": "custom",
                        "tokenizer": "edge_ngram_tokenizer",
                        "filter": ["lowercase"]
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
                "PK": {"type": "keyword"},
                "SK": {"type": "keyword"},
                "codigo": {"type": "keyword"},
                "tenant_id": {"type": "keyword"},
                "nombre": {
                    "type": "text",
                    "analyzer": "producto_analyzer",
                    "fields": {
                        "autocomplete": {
                            "type": "text",
                            "analyzer": "autocomplete_analyzer"
                        }
                    }
                },
                "descripcion": {
                    "type": "text",
                    "analyzer": "producto_analyzer"
                },
                "precio": {"type": "float"},
                "categoria": {"type": "keyword"},
                "stock": {"type": "integer"},
                "activo": {"type": "boolean"},
                "tags": {"type": "keyword"},
                "created_at": {"type": "date"},
                "updated_at": {"type": "date"}
            }
        }
    }
    
    try:
        if not es_client.indices.exists(index=index_name):
            es_client.indices.create(index=index_name, body=mapping)
            logger.info(f"Índice creado: {index_name}")
        else:
            logger.info(f"Índice ya existe: {index_name}")
    except Exception as e:
        logger.error(f"Error al crear índice: {e}")

def index_product(es_client, index_name, product):
    """Indexa un producto en Elasticsearch"""
    try:
        # Extraer código del SK (producto#<codigo>)
        sk_parts = product.get('SK', '').split('#')
        product_code = sk_parts[1] if len(sk_parts) > 1 else product.get('codigo', '')
        
        document = {
            "PK": product.get('PK'),
            "SK": product.get('SK'),
            "codigo": product_code,
            "tenant_id": product.get('tenant_id'),
            "nombre": product.get('nombre'),
            "descripcion": product.get('descripcion', ''),
            "precio": product.get('precio', 0),
            "categoria": product.get('categoria'),
            "stock": product.get('stock', 0),
            "activo": product.get('activo', False),
            "tags": product.get('tags', []),
            "created_at": product.get('created_at'),
            "updated_at": product.get('updated_at')
        }
        
        response = es_client.index(
            index=index_name,
            id=product.get('SK'),  # Usar SK como ID único
            body=document,
            refresh=True
        )
        logger.info(f"Producto indexado: {response['_id']}")
        return response
    except Exception as e:
        logger.error(f"Error al indexar: {e}")

def delete_product(es_client, index_name, product):
    """Elimina un producto de Elasticsearch"""
    try:
        response = es_client.delete(
            index=index_name,
            id=product.get('SK'),
            refresh=True
        )
        logger.info(f"Producto eliminado: {response['_id']}")
        return response
    except Exception as e:
        logger.error(f"Error al eliminar: {e}")

def lambda_handler(event, context):
    """Procesa eventos de DynamoDB Streams"""
    try:
        logger.info(f"Eventos recibidos: {len(event['Records'])}")
        es_client = get_elasticsearch_client()
        
        for record in event['Records']:
            event_name = record['eventName']
            
            if event_name in ['INSERT', 'MODIFY']:
                new_image = record['dynamodb'].get('NewImage', {})
                product = transform_dynamo_item(new_image)
                
                if product.get('activo') and 'producto#' in product.get('SK', ''):
                    tenant_id = product.get('PK')  # PK = tenant_id
                    index_name = f"productos_{tenant_id}"
                    create_index_mapping(es_client, index_name)
                    index_product(es_client, index_name, product)
                
            elif event_name == 'REMOVE':
                old_image = record['dynamodb'].get('OldImage', {})
                product = transform_dynamo_item(old_image)
                
                if 'producto#' in product.get('SK', ''):
                    tenant_id = product.get('PK')
                    index_name = f"productos_{tenant_id}"
                    delete_product(es_client, index_name, product)
        
        return {'statusCode': 200, 'body': 'Procesamiento exitoso'}
    
    except Exception as e:
        logger.error(f"Error en handler: {e}")
        return {'statusCode': 500, 'body': str(e)}