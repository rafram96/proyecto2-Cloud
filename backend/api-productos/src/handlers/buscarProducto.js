const { validateJWT, createResponse, requireAuth } = require('../utils/auth');
const { getItem, getTable } = require('../utils/dynamodb');

// BUSCAR PRODUCTO
const baseHandler = async (event, context) => {
    try {
        console.log(event);
        
        // Validar token JWT invocando Lambda ValidarTokenAcceso
        const userContext = await validateJWT(event);
        if (userContext.error) {
            return createResponse(403, {
                'status': 'Forbidden - Acceso No Autorizado'
            });
        }

        // Manejar el caso en que body sea string o diccionario
        let body;
        if (typeof event['body'] === 'string') {
            body = JSON.parse(event['body']);
        } else {
            body = event['body'];
        }
        
        const tenant_id = body['tenant_id'];
        const codigo = body['codigo'] || event.pathParameters?.codigo;
        
        if (!codigo) {
            return createResponse(400, {
                'error': 'Código del producto requerido'
            });
        }

        // Conectar DynamoDB
        const table = getTable(process.env.PRODUCTOS_TABLE);

        // Buscar producto por código y tenant_id
        const key = {
            codigo: codigo,
            tenant_id: tenant_id
        };

        const result = await getItem(table, key);

        if (result.error) {
            return createResponse(500, {
                'error': result.error
            });
        }

        if (!result.data) {
            return createResponse(404, {
                'status': 'Producto no encontrado'
            });
        }

        const producto = result.data;

        // Verificar que el producto esté activo
        if (!producto.activo) {
            return createResponse(404, {
                'status': 'Producto no disponible'
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
        return createResponse(200, { producto: productoFormatted });

    } catch (error) {
        // Excepción y retornar un código de error HTTP 500
        console.error('Exception:', error);
        return createResponse(500, {
            'error': error.message
        });
    }
};
exports.lambda_handler = requireAuth(baseHandler);
