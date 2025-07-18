const { createResponse, requireAuth } = require('../utils/auth');
const { updateItem, getItem, getTable } = require('../utils/dynamodb');

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Tenant-Id,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'OPTIONS,POST',
    'Content-Type': 'application/json'
};

const baseHandler = async (event, context) => {
    try {
        console.log('Update product event:', event);
        
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

        // Obtener código del producto del cuerpo de la petición
        let body;
        if (typeof event['body'] === 'string') {
            body = JSON.parse(event['body']);
        } else {
            body = event['body'];
        }

        const codigo = body['codigo'];
        if (!codigo) {
            return createResponse(400, { success: false, error: 'Código del producto requerido' });
        }

        // Validar que se envió al menos un campo para actualizar
        const camposPermitidos = ['nombre', 'descripcion', 'precio', 'categoria', 'stock', 'imagen_url', 'tags'];
        const camposEnviados = Object.keys(body).filter(key => camposPermitidos.includes(key));

        if (camposEnviados.length === 0) {
            return createResponse(400, { success: false, error: 'Debe enviar al menos un campo válido para actualizar' });
        }

        const table = getTable(process.env.PRODUCTOS_TABLE);

        // Verificar que el producto existe y pertenece al tenant usando las claves correctas
        const key = {
            tenant_id: userContext.tenant_id,
            SK: `PRODUCTO#${codigo}`
        };

        const existingProduct = await getItem(table, key);
        if (existingProduct.error) {
            return createResponse(500, { success: false, error: existingProduct.error });
        }

        if (!existingProduct.data) {
            return createResponse(404, { success: false, error: 'Producto no encontrado' });
        }

        if (!existingProduct.data.activo) {
            return createResponse(400, { success: false, error: 'No se puede actualizar un producto inactivo' });
        }

        // Validar tipos de datos si se proporcionan
        if (body.precio !== undefined) {
            if (typeof body.precio !== 'number' || body.precio <= 0) {
                return createResponse(400, { success: false, error: 'El precio debe ser un número mayor a 0' });
            }
        }

        if (body.stock !== undefined) {
            if (typeof body.stock !== 'number' || body.stock < 0) {
                return createResponse(400, { success: false, error: 'El stock debe ser un número mayor o igual a 0' });
            }
        }

        // Construir expresión de actualización
        let updateExpression = 'SET updated_at = :updated_at, updated_by = :updated_by';
        let expressionAttributeValues = {
            ':updated_at': new Date().toISOString(),
            ':updated_by': userContext.user_id
        };

        // Agregar campos a actualizar
        camposEnviados.forEach(campo => {
            updateExpression += `, ${campo} = :${campo}`;
            expressionAttributeValues[`:${campo}`] = body[campo];
        });

        // Ejecutar actualización
        const updateResult = await updateItem(table, key, updateExpression, expressionAttributeValues);

        if (updateResult.error) {
            return createResponse(500, { success: false, error: updateResult.error });
        }

        // Obtener el producto actualizado
        const updatedProduct = await getItem(table, key);
        if (updatedProduct.error) {
            return createResponse(500, { success: false, error: updatedProduct.error });
        }

        const producto = updatedProduct.data;

        // Formatear producto para respuesta
        const productoFormatted = {
            codigo: producto.codigo,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: producto.precio,
            categoria: producto.categoria,
            stock: producto.stock,
            imagen_url: producto.imagen_url || '',
            tags: producto.tags || [],
            updated_at: producto.updated_at,
            updated_by: producto.updated_by
        };

        // Respuesta uniforme
        return createResponse(200, { success: true, data: productoFormatted });

    } catch (error) {
        console.error('Error al actualizar producto:', error);
        
        if (error instanceof SyntaxError) {
            return createResponse(400, { success: false, error: 'JSON inválido' });
        }
        
        return createResponse(500, { success: false, error: 'Error interno del servidor' });
    }
};
// Proteger endpoint con JWT
exports.lambda_handler = requireAuth(baseHandler);
