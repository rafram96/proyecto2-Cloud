const { createResponse, requireAuth } = require('../utils/auth');
const { getItem, getTable } = require('../utils/dynamodb');

/**
 * @typedef {import('../utils/types').Product} Product
 * @typedef {import('../utils/types').ApiResponse<Product>} ApiResponse
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Tenant-Id',
    'Access-Control-Allow-Methods': 'OPTIONS,POST',
    'Content-Type': 'application/json'
};

// BUSCAR PRODUCTO
const baseHandler = async (event, context) => {
    try {
        console.log('Search product event:', event);
        
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

        // Manejar el caso en que body sea string o diccionario
        let body;
        if (typeof event['body'] === 'string') {
            body = JSON.parse(event['body']);
        } else {
            body = event['body'];
        }
        
        // Forzar multi-tenant: siempre usar tenant_id del contexto
        const tenant_id = userContext.tenant_id;
        const codigo = body['codigo'] || event.pathParameters?.codigo;
        
        if (!codigo) {
            return createResponse(400, {
                success: false,
                error: 'Código del producto requerido'
            });
        }

        // Conectar DynamoDB
        const table = getTable(process.env.PRODUCTOS_TABLE);

        // Buscar producto por código y tenant_id usando las claves correctas de DynamoDB
        const key = {
            tenant_id: tenant_id,
            SK: `producto#${codigo}`
        };

        const result = await getItem(table, key);

        if (result.error) {
            return createResponse(500, {
                success: false,
                error: result.error
            });
        }

        if (!result.data) {
            return createResponse(404, {
                success: false,
                error: 'Producto no encontrado'
            });
        }

        const producto = result.data;

        // Verificar que el producto esté activo
        if (!producto.activo) {
            return createResponse(404, {
                success: false,
                error: 'Producto no disponible'
            });
        }

        // Formatear producto para respuesta alineada con data-model
        const productoFormatted = {
            codigo: producto.codigo,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: producto.precio,
            categoria: producto.categoria,
            stock: producto.stock,
            imagen_url: producto.imagen_url || '',
            tags: producto.tags || [],
            activo: producto.activo,
            created_at: producto.created_at,
            updated_at: producto.updated_at,
            created_by: producto.created_by,
            updated_by: producto.updated_by
        };
        // Respuesta uniforme
        return createResponse(200, {
            success: true,
            data: productoFormatted
        });

    } catch (error) {
        // Excepción y retornar un código de error HTTP 500
        console.error('Exception:', error);
        return createResponse(500, {
            success: false,
            error: error.message
        });
    }
};
exports.lambda_handler = requireAuth(baseHandler);
