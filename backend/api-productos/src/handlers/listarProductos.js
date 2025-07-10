const { createResponse, requireAuth } = require('../utils/auth');
const { getTable } = require('../utils/dynamodb');

/**
 * @typedef {import('../utils/types').Product} Product
 * @typedef {import('../utils/types').ApiResponse<{ items: Product[]; pagination: any; count: number; }>} ApiResponseList
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Tenant-Id',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
    'Content-Type': 'application/json'
};

// LISTAR PRODUCTOS
const baseHandler = async (event, context) => {
    try {
        console.log('List products event:', event);
        
        // Manejar preflight OPTIONS
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: ''
            };
        }
        
        // userContext inyectado por requireAuth
        const userContext = event.userContext;
        // Manejar body para POST requests
        let body = {};
        if (event.body) {
            if (typeof event.body === 'string') {
                body = JSON.parse(event.body);
            } else {
                body = event.body;
            }
        }

        // Obtener parámetros de query para paginación y filtros
        const urlQueryParams = event.queryStringParameters || {};
        const page = parseInt(body.page || urlQueryParams.page) || 1;
        const limit = parseInt(body.limit || urlQueryParams.limit) || 12;
        const categoria = body.categoria || urlQueryParams.categoria;
        const busqueda = body.search || urlQueryParams.search;

        // Validar límite de paginación
        if (limit > 100) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: false,
                    error: 'El límite máximo es 100 productos por página'
                })
            };
        }

         // Conectar DynamoDB
         const table = getTable(process.env.PRODUCTOS_TABLE);

         // Usar Query con nueva estructura: tenant_id como PK, SK = PRODUCTO#<codigo>
         const queryParams = {
             KeyConditionExpression: 'tenant_id = :tenant_id AND begins_with(SK, :prefix)',
             ExpressionAttributeValues: {
                 ':tenant_id': userContext.tenant_id,
                 ':prefix': 'PRODUCTO#',
                 ':activo': true
             },
             FilterExpression: 'activo = :activo',
             Limit: limit,
             ConsistentRead: true
         };

         // Filtro por categoría
         if (categoria) {
             queryParams.FilterExpression += ' AND categoria = :categoria';
             queryParams.ExpressionAttributeValues[':categoria'] = categoria;
         }

         // Filtro por búsqueda (en nombre o descripción)
         if (busqueda) {
             queryParams.FilterExpression += ' AND (contains(#nombre, :busqueda) OR contains(descripcion, :busqueda))';
             queryParams.ExpressionAttributeNames = { '#nombre': 'nombre' };
             queryParams.ExpressionAttributeValues[':busqueda'] = busqueda;
         }

        const result = await table.query(queryParams).promise();

        // Formatear respuesta
        const productos = result.Items.map(producto => ({
            codigo: producto.codigo,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: producto.precio,
            categoria: producto.categoria,
            stock: producto.stock,
            imagen_url: producto.imagen_url,
            tags: producto.tags || [],
            created_at: producto.created_at,
            updated_at: producto.updated_at,
            created_by: producto.created_by,
            updated_by: producto.updated_by
        }));

        const response = {
            success: true,
            data: {
                productos: productos,
                count: productos.length,
                pagination: {
                    page,
                    limit,
                    hasMore: !!result.LastEvaluatedKey,
                    nextKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : undefined
                }
            }
        };

        // Retornar respuesta uniforme
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(response)
        };

    } catch (error) {
        // Excepción y retornar un código de error HTTP 500
        console.error('Exception listing products:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: error.message || 'Error interno del servidor'
            })
        };
    }
};
exports.lambda_handler = requireAuth(baseHandler);
