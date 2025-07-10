const crypto = require('crypto');
const { createResponse, requireAuth } = require('../utils/auth');
const { getTable, createItem } = require('../utils/dynamodb');

/**
 * @typedef {import('../utils/types').Product} Product
 * @typedef {import('../utils/types').ApiResponse<Product>} ApiResponse
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Tenant-Id,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'OPTIONS,POST',
    'Content-Type': 'application/json'
};

// CREAR PRODUCTO
const baseHandler = async (event, context) => {
    try {
        console.log('Create product event:', event);
        
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
        
        // Obtener datos del producto
        const nombre = body.nombre;
        const descripcion = body.descripcion;
        const precio = body.precio;
        const categoria = body.categoria;
        const stock = body.stock;
        const imagen_url = body.imagen_url || '';
        const tags = body.tags || [];
        // Verificar que los campos requeridos existen
        if (nombre && descripcion && precio && categoria && stock !== undefined) {
            // Validar tipos de datos
            if (typeof precio !== 'number' || precio <= 0) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: false,
                        error: 'El precio debe ser un número mayor a 0'
                    })
                };
            }

            if (typeof stock !== 'number' || stock < 0) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: false,
                        error: 'El stock debe ser un número mayor o igual a 0'
                    })
                };
            }

            // Generar código único del producto
            const codigo = crypto.randomUUID();
            
            // Obtener tenant_id del contexto del usuario
            const tenant_id = userContext.tenant_id;
            
            // Crear claves primarias según nueva estructura
            const pk = tenant_id;                    // PK = tenant_id
            const sk = `producto#${codigo}`;         // SK = producto#<codigo>

            // Conectar DynamoDB
            const table = getTable(process.env.PRODUCTOS_TABLE);

            const timestamp = new Date().toISOString();

            // Crear objeto producto con nueva estructura multi-tenant
            const producto = {
                PK: pk,
                SK: sk,
                tenant_id: tenant_id,
                codigo: codigo,
                nombre: nombre,
                descripcion: descripcion,
                precio: precio,
                categoria: categoria,
                stock: stock,
                imagen_url: imagen_url,
                tags: tags,
                activo: true,
                created_at: timestamp,
                updated_at: timestamp,
                created_by: userContext.user_id,
                updated_by: userContext.user_id,
                deleted_at: null,
                deleted_by: null
            };

            // Guardar en DynamoDB
            const result = await createItem(table, producto);

            if (result.error) {
                return {
                    statusCode: 500,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: false,
                        error: result.error
                    })
                };
            }

            // Retornar un código de estado HTTP 201 (Created) y un mensaje de éxito con campos alineados
            return {
                statusCode: 201,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: true,
                    message: 'Producto creado exitosamente',
                    data: {
                        codigo: producto.codigo,
                        nombre: producto.nombre,
                        descripcion: producto.descripcion,
                        precio: producto.precio,
                        categoria: producto.categoria,
                        stock: producto.stock,
                        imagen_url: producto.imagen_url,
                        tags: producto.tags,
                        created_at: producto.created_at
                    }
                })
            };
        } else {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: false,
                    error: 'Campos requeridos: nombre, descripcion, precio, categoria, stock'
                })
            };
        }

    } catch (error) {
        // Excepción y retornar un código de error HTTP 500
        console.error('Exception:', error);
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
