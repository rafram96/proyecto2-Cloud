const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

/**
 * Obtiene una referencia a una tabla de DynamoDB
 */
const getTable = (tableName) => {
    return {
        put: (params) => dynamodb.put({ TableName: tableName, ...params }).promise(),
        get: (params) => dynamodb.get({ TableName: tableName, ...params }).promise(),
        update: (params) => dynamodb.update({ TableName: tableName, ...params }).promise(),
        delete: (params) => dynamodb.delete({ TableName: tableName, ...params }).promise(),
        query: (params) => dynamodb.query({ TableName: tableName, ...params }).promise(),
        scan: (params) => dynamodb.scan({ TableName: tableName, ...params }).promise()
    };
};

/**
 * Crea un item en DynamoDB
 */
const createItem = async (table, item) => {
    try {
        const result = await table.put({ Item: item });
        return { data: result, error: null };
    } catch (error) {
        console.error('Error al crear item en DynamoDB:', error);
        return { data: null, error: `Error DynamoDB: ${error.message}` };
    }
};

/**
 * Obtiene un item de DynamoDB por clave
 */
const getItem = async (table, key) => {
    try {
        const result = await table.get({ Key: key });
        return { data: result.Item, error: null };
    } catch (error) {
        console.error('Error al obtener item de DynamoDB:', error);
        return { data: null, error: `Error DynamoDB: ${error.message}` };
    }
};

/**
 * Actualiza un item en DynamoDB
 */
const updateItem = async (table, key, updateExpression, expressionAttributeValues, expressionAttributeNames = null) => {
    try {
        const params = {
            Key: key,
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'UPDATED_NEW'
        };

        if (expressionAttributeNames) {
            params.ExpressionAttributeNames = expressionAttributeNames;
        }

        const result = await table.update(params);
        return { data: result, error: null };
    } catch (error) {
        console.error('Error al actualizar item en DynamoDB:', error);
        return { data: null, error: `Error DynamoDB: ${error.message}` };
    }
};

/**
 * Elimina un item de DynamoDB
 */
const deleteItem = async (table, key) => {
    try {
        const result = await table.delete({ Key: key });
        return { data: result, error: null };
    } catch (error) {
        console.error('Error al eliminar item de DynamoDB:', error);
        return { data: null, error: `Error DynamoDB: ${error.message}` };
    }
};

/**
 * Realiza una query en DynamoDB
 */
const queryItems = async (table, keyConditionExpression, options = {}) => {
    try {
        const params = {
            KeyConditionExpression: keyConditionExpression,
            ...options
        };

        const result = await table.query(params);
        return { data: result, error: null };
    } catch (error) {
        console.error('Error al hacer query en DynamoDB:', error);
        return { data: null, error: `Error DynamoDB: ${error.message}` };
    }
};

/**
 * Realiza un scan en DynamoDB
 */
const scanItems = async (table, options = {}) => {
    try {
        const result = await table.scan(options);
        return { data: result, error: null };
    } catch (error) {
        console.error('Error al hacer scan en DynamoDB:', error);
        return { data: null, error: `Error DynamoDB: ${error.message}` };
    }
};

module.exports = {
    getTable,
    createItem,
    getItem,
    updateItem,
    deleteItem,
    queryItems,
    scanItems
};
