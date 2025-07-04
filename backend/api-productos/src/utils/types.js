/**
 * @typedef {Object} Product
 * @property {string} PK                      Clave de partición (tenant_id)
 * @property {string} SK                      Clave de ordenación (`producto#<codigo>`)
 * @property {string} tenant_id               Identificador del tenant
 * @property {string} codigo                  UUID del producto
 * @property {string} nombre                  Nombre del producto
 * @property {string} descripcion             Descripción detallada
 * @property {number} precio                  Precio en la moneda local
 * @property {string} categoria               Categoría del producto
 * @property {number} stock                   Unidades disponibles
 * @property {string} imagen_url              URL pública de la imagen (S3)
 * @property {string[]} tags                  Lista de etiquetas
 * @property {boolean} activo                 Estado lógico
 * @property {string} created_at              Timestamp ISO 8601 de creación
 * @property {string} updated_at              Timestamp ISO 8601 de última modificación
 * @property {string} created_by              user_id que creó el registro
 * @property {string} updated_by              user_id de la última modificación
 * @property {string} [deleted_at]            Timestamp de eliminación lógica
 * @property {string} [deleted_by]            user_id que eliminó el producto
 */

/**
 * @template T
 * @typedef {Object} ApiResponse
 * @property {boolean} success                Indica si la operación fue exitosa
 * @property {T} [data]                       Payload con los datos de la respuesta
 * @property {string} [error]                 Mensaje de error en caso de falla
 */
