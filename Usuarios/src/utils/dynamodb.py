import boto3
from botocore.exceptions import ClientError

def get_dynamodb_table(table_name):
    """
    Obtiene una referencia a una tabla de DynamoDB
    """
    try:
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(table_name)
        return table
    except Exception as e:
        print(f"Error al conectar con DynamoDB: {e}")
        raise

def create_item(table, item):
    """
    Crea un item en DynamoDB
    """
    try:
        response = table.put_item(Item=item)
        return response, None
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        return None, f"Error DynamoDB {error_code}: {error_message}"
    except Exception as e:
        return None, f"Error inesperado: {str(e)}"

def get_item(table, key):
    """
    Obtiene un item de DynamoDB por clave
    """
    try:
        response = table.get_item(Key=key)
        return response.get('Item'), None
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        return None, f"Error DynamoDB {error_code}: {error_message}"
    except Exception as e:
        return None, f"Error inesperado: {str(e)}"

def update_item(table, key, update_expression, expression_values):
    """
    Actualiza un item en DynamoDB
    """
    try:
        response = table.update_item(
            Key=key,
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_values,
            ReturnValues="UPDATED_NEW"
        )
        return response, None
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        return None, f"Error DynamoDB {error_code}: {error_message}"
    except Exception as e:
        return None, f"Error inesperado: {str(e)}"

def query_items(table, key_condition_expression, **kwargs):
    """
    Realiza una query en DynamoDB
    """
    try:
        response = table.query(
            KeyConditionExpression=key_condition_expression,
            **kwargs
        )
        return response.get('Items', []), None
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        return None, f"Error DynamoDB {error_code}: {error_message}"
    except Exception as e:
        return None, f"Error inesperado: {str(e)}"
