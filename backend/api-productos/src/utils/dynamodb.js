const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

/**
 * Devuelve un objeto con métodos de DocumentClient ligados a la tabla dada.
 * @param {string} tableName
 */
function getTable(tableName) {
  return {
    query: (params) => docClient.query({ TableName: tableName, ...params }),
    get: (params) => docClient.get({ TableName: tableName, ...params }),
    put: (params) => docClient.put({ TableName: tableName, ...params }),
    update: (params) => docClient.update({ TableName: tableName, ...params }),
    delete: (params) => docClient.delete({ TableName: tableName, ...params }),
    scan: (params) => docClient.scan({ TableName: tableName, ...params })
  };
}

/**
 * Obtener un ítem por clave.
 * @param {*} table  Objeto retornado por getTable
 * @param {{PK: string, SK: string}} key
 * @returns {{ data?: any, error?: string }}
 */
async function getItem(table, key) {
  try {
    const result = await table.get({ Key: key }).promise();
    return { data: result.Item };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Crear un nuevo ítem.
 * @param {*} table
 * @param {Object} item
 * @returns {{ data?: any, error?: string }}
 */
async function createItem(table, item) {
  try {
    await table.put({ Item: item }).promise();
    return { data: item };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Actualizar un ítem existente y devolver sus atributos nuevos.
 * @param {*} table
 * @param {Object} key
 * @param {string} updateExpression
 * @param {Object} expressionAttributeValues
 * @returns {{ data?: any, error?: string }}
 */
async function updateItem(table, key, updateExpression, expressionAttributeValues) {
  try {
    const params = {
      Key: key,
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };
    const result = await table.update(params).promise();
    return { data: result.Attributes };
  } catch (error) {
    return { error: error.message };
  }
}

module.exports = { getTable, getItem, createItem, updateItem };
