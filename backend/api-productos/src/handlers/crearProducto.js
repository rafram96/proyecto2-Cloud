const { v4: uuidv4 } = require('uuid');
const { validateJWT, createResponse, requireAuth } = require('../utils/auth');
const { createItem, getTable } = require('../utils/dynamodb');

// CREAR PRODUCTO
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
                return createResponse(400, {
                    'error': 'El precio debe ser un número mayor a 0'
                });
            }

            if (typeof stock !== 'number' || stock < 0) {
                return createResponse(400, {
                    'error': 'El stock debe ser un número mayor o igual a 0'
                });
            }

            // Generar código único del producto
            const codigo = uuidv4();
            
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
                return createResponse(500, {
                    'error': result.error
                });
            }

            // Retornar un código de estado HTTP 201 (Created) y un mensaje de éxito con campos alineados
            return createResponse(201, {
                message: 'Producto creado exitosamente',
                producto: {
                    codigo: producto.codigo,
                    nombre: producto.nombre,
                    descripcion: producto.descripcion,
                    precio: producto.precio,
                    categoria: producto.categoria,
                    stock: producto.stock,
                    imagen_url: producto.imagen_url,
                    tags: producto.tags,
                    activo: producto.activo,
                    created_at: producto.created_at,
                    updated_at: producto.updated_at,
                    created_by: producto.created_by,
                    updated_by: producto.updated_by
                }
            });} else {
            return createResponse(400, {
                'error': 'Campos requeridos: nombre, descripcion, precio, categoria, stock'
            });
        }

    } catch (error) {
        // Excepción y retornar un código de error HTTP 500
        console.error('Exception:', error);
        return createResponse(500, {
            'error': error.message
        });
    }
};

exports.lambda_handler = requireAuth(baseHandler);
