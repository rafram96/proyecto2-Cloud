# 📊 Data Models

## 1. Usuario (`p_usuarios`)

Tabla DynamoDB: **p_usuarios-${stage}**

| Campo        | Tipo    | Descripción                                          |
| ------------ | ------- | ---------------------------------------------------- |
| `email`      | String  | Identificador principal (PK). Correo del usuario.    |
| `tenant_id`  | String  | Identificador del tenant (SK).                       |
| `user_id`    | String  | UUID generado internamente.                          |
| `nombre`     | String  | Nombre completo del usuario.                         |
| `password`   | String  | Hash SHA256 de la contraseña.                        |        |

---

## 2. Producto (`p_productos`)

Tabla DynamoDB: **p_productos-${stage}**

| Campo        | Tipo      | Descripción                                                  |
| ------------ | --------- | ------------------------------------------------------------ |
| `PK`         | String    | `tenant_id` (clave de partición).                            |
| `SK`         | String    | `producto#<codigo>` (clave de ordenación).                   |
| `tenant_id`  | String    | Identificador del tenant.                                    |
| `codigo`     | String    | UUID del producto (sin prefijo).                             |
| `nombre`     | String    | Nombre del producto.                                         |
| `descripcion`| String    | Descripción detallada.                                       |
| `precio`     | Number    | Precio en la moneda local.                                  |
| `categoria`  | String    | Categoría del producto (para GSI).                           |
| `stock`      | Number    | Unidades disponibles.                                        |
| `imagen_url` | String    | URL pública de la imagen (S3).                               |
| `tags`       | List      | Lista de etiquetas (ej. `["electronics","sale"]`).        |
| `activo`     | Boolean   | Estado lógico: `true` si está disponible, `false` si no.     |
| `created_at` | String    | Timestamp ISO 8601 de creación.                              |
| `updated_at` | String    | Timestamp ISO 8601 de última modificación.                   |
| `created_by` | String    | `user_id` que creó el registro.                              |
| `updated_by` | String    | `user_id` que realizó la última actualización.               |
| `deleted_at` | String    | Timestamp ISO 8601 de eliminación lógica (solo si `activo=false`). |
| `deleted_by` | String    | `user_id` que eliminó el producto (solo si `activo=false`). |

---

## 3. Subida de Imágenes (S3 Drag & Drop)

Se puede implementar un componente de frontend que permita arrastrar y soltar imágenes para subirlas a un bucket de S3.

### Pasos Generales:
1. **Crear un Bucket S3** con políticas públicas para servir las imágenes.  
2. **Configurar CORS** en el bucket:
   ```xml
   <CORSConfiguration>
     <CORSRule>
       <AllowedOrigin>*</AllowedOrigin>
       <AllowedMethod>PUT</AllowedMethod>
       <AllowedMethod>POST</AllowedMethod>
       <AllowedMethod>GET</AllowedMethod>
       <AllowedHeader>*</AllowedHeader>
     </CORSRule>
   </CORSConfiguration>
   ```
3. **Obtener credenciales** (pre-signed URLs) desde una función Lambda protegida para subir archivos:
   - Lambda genera `getSignedUrl('putObject', { Bucket, Key, ContentType })` y lo retorna al cliente.
4. **Frontend**:
   - Con Axios o Fetch, hace `PUT` a la URL pre-firmada con el blob del archivo.
   - Recibe la URL de acceso público y la asigna a `imagen_url` en el producto.

Con esta configuración, tu UI podrá subir y mostrar imágenes directamente desde S3 sin exponer credenciales AWS.
