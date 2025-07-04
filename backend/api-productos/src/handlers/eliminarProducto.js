const { createResponse, requireAuth } = require('../utils/auth');
const { updateItem, getItem, getTable } = require('../utils/dynamodb');

const baseHandler = async (event, context) => {
    try {
        const userContext = event.userContext;

        // Obtener código del producto de los path parameters
        const codigo = event.pathParameters?.codigo;
        if (!codigo) {
            return createResponse(400, { error: 'Código del producto requerido' });
        }

        const table = getTable(process.env.PRODUCTOS_TABLE);

        // Verificar que el producto existe y pertenece al tenant
        const key = {
            codigo: codigo,
            tenant_id: userContext.tenant_id
        };

        const existingProduct = await getItem(table, key);
        if (existingProduct.error) {
            return createResponse(500, { error: existingProduct.error });
        }

        if (!existingProduct.data) {
            return createResponse(404, { error: 'Producto no encontrado' });
        }

        if (!existingProduct.data.activo) {
            return createResponse(400, { error: 'El producto ya está inactivo' });
        }

        // Realizar eliminación lógica (soft delete)
        const updateExpression = 'SET activo = :activo, updated_at = :updated_at, deleted_by = :deleted_by, deleted_at = :deleted_at';
        const expressionAttributeValues = {
            ':activo': false,
            ':updated_at': new Date().toISOString(),
            ':deleted_by': userContext.user_id,
            ':deleted_at': new Date().toISOString()
        };

        const result = await updateItem(table, key, updateExpression, expressionAttributeValues);

        if (result.error) {
            return createResponse(500, { error: result.error });
        }

        return createResponse(200, {
            message: 'Producto eliminado exitosamente',
            codigo: codigo,
            deleted_at: expressionAttributeValues[':deleted_at'],
            deleted_by: expressionAttributeValues[':deleted_by']
        });

    } catch (error) {
        console.error('Error al eliminar producto:', error);
        return createResponse(500, { error: 'Error interno del servidor' });
    }
};
// Proteger endpoint con JWT
exports.handler = requireAuth(baseHandler);
