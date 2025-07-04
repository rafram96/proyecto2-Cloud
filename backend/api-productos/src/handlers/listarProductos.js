const { createResponse, requireAuth } = require('../utils/auth');
const { getTable } = require('../utils/dynamodb');

/**
 * @typedef {import('../utils/types').Product} Product
 * @typedef {import('../utils/types').ApiResponse<{ items: Product[]; pagination: any; count: number; }>} ApiResponseList
 */

// LISTAR PRODUCTOS
const baseHandler = async (event, context) => {
    try {
        console.log(event);
        
        // userContext inyectado por requireAuth
        const userContext = event.userContext;
     // Obtener parámetros de query para paginación
     const urlQueryParams = event.queryStringParameters || {};
    const limit = parseInt(urlQueryParams.limit) || 10;
    const lastKey = urlQueryParams.lastKey ? JSON.parse(decodeURIComponent(urlQueryParams.lastKey)) : undefined;
     const categoria = urlQueryParams.categoria;
     const busqueda = urlQueryParams.busqueda;

     // Validar límite de paginación
     if (limit > 100) {
        return createResponse(400, { success: false, error: 'El límite máximo es 100 productos por página' });
     }        // Conectar DynamoDB
     const table = getTable(process.env.PRODUCTOS_TABLE);

     // Usar Query con nueva estructura: PK = tenant_id, SK = producto#<codigo>
     const queryParams = {
         KeyConditionExpression: 'PK = :tenant_id AND begins_with(SK, :prefix)',
         ExpressionAttributeValues: {
             ':tenant_id': userContext.tenant_id,
             ':prefix': 'producto#',
             ':activo': true
         },
         FilterExpression: 'activo = :activo',
         Limit: limit
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

     // Agregar lastKey para paginación
     if (lastKey) {
         queryParams.ExclusiveStartKey = lastKey;
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
            items: productos,
            count: productos.length,
            pagination: {
                limit,
                hasMore: !!result.LastEvaluatedKey,
                nextKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : undefined
            }
        }
    };

     // Retornar respuesta uniforme
     return createResponse(200, response);

    } catch (error) {
        // Excepción y retornar un código de error HTTP 500
        console.error('Exception:', error);
        return createResponse(500, {
            'error': error.message
        });
    }
};
exports.lambda_handler = requireAuth(baseHandler);
