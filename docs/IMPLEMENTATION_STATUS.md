# 📋 Estado de Implementación del Sistema Multi-Tenant

Este documento resume qué partes del proyecto **ya están implementadas** y cuáles se mantienen como **planeamiento a futuro**.

---

## 1. api-usuarios

### Endpoints Disponibles (Implementados)

| Ruta                        | Método | Descripción                                        | Protegido |
|-----------------------------|--------|----------------------------------------------------|-----------|
| `/usuarios/crear`           | POST   | Registro de nuevo usuario en un tenant existente   | No        |
| `/usuarios/login`           | POST   | Login y emisión de JWT                             | No        |
| `/usuarios/validar`         | GET    | Verificación de validez de token JWT               | No        |

### Lógica y Recursos

- Almacenamiento en DynamoDB (`t_usuarios`):
  - Usuarios: PK = `tenant_id#user_id`, SK = email.
- Funcionalidad de JWT:
  - `login_usuario.py` genera un token con `usuario_id` y `tenant_id`.
  - `validar_token.py` verifica validez del token.

### Planeamiento Futuro (No implementado aún)

- Ninguno por el momento.

---

## 2. api-productos

### Endpoints Disponibles (Implementados)

| Ruta                  | Método | Descripción                          | Protegido |
|-----------------------|--------|--------------------------------------|-----------|
| `/productos/crear`    | POST   | Crear nuevo producto                 | Sí        |
| `/productos/listar`   | POST   | Listar productos paginados           | Sí        |
| `/productos/buscar`   | POST   | Búsqueda de productos por nombre     | Sí        |
| `/productos/actualizar`| POST  | Actualizar datos de un producto      | Sí        |
| `/productos/eliminar` | POST   | Marcar producto como inactivo o borrarlo | Sí    |

### Lógica y Recursos

- Almacenamiento en DynamoDB (`t_productos`):
  - PK = `tenant_id`, SK = `producto#<codigo>`.
  - Campos: `codigo`, `nombre`, `descripcion`, `precio`, `categoria`, `stock`, `imagen_url`, `tags`, `activo`, `created_at`, `updated_at`, `created_by`.
- Todos los handlers invocan `validateJWT(event)` y extraen `tenant_id` del token.
- Se evitan accesos cross-tenant devolviendo HTTP 403.
- Stream de DynamoDB configurado para sincronizar con Elasticsearch (Lambda de ingesta).

### Planeamiento Futuro (No implementado aún)

- Endpoints de administración de índices de Elasticsearch.
- Integración directa de creación de índices ES al on-boarding de nuevo tenant.
- Roles de producto (`admin` vs `viewer`).

---

## 3. api-compras

### Endpoints Disponibles (Implementados)

| Ruta                  | Método | Descripción                         | Protegido |
|-----------------------|--------|-------------------------------------|-----------|
| `/compras/crear`      | POST   | Crear nueva compra                  | Sí        |
| `/compras/listar`     | POST   | Listar compras paginadas por usuario| Sí        |

### Lógica y Recursos

- Almacenamiento en DynamoDB (`t_compras`):
  - PK = `tenant_id#usuario_id`, SK = `compra#<compra_id>`.
  - Campos: `compra_id`, `usuario_id`, `tenant_id`, `items`, `total`, `created_at`, etc.
- Todos los handlers invocan `validateJWT(event)` y extraen `tenant_id`.
- Se evita acceso cross-tenant devolviendo HTTP 403.
- Stream de DynamoDB habilitado (`NEW_AND_OLD_IMAGES`) para posibles integraciones.

### Planeamiento Futuro (No implementado aún)

- Indexar compras en Elasticsearch para análisis y búsqueda avanzada.

---

## 4. Ingesta de Datos (Lambda-ingesta)

### Función de Sincronización con Elasticsearch

- Servicio definido en `infrastructure/lambda-ingesta` con Serverless.
- `actualizar_productos_elasticsearch.py`: procesa Streams de la tabla `t_productos` y actualiza índices ES.
- Consume eventos `INSERT`, `MODIFY` y `REMOVE` para mantener coherencia.
- Indexes creados por tenant en ES (`productos-<tenant_id>`).

### Planeamiento Futuro (No implementado aún)

- Agregar Lambda para sincronizar compras en ES.

---

## 5. Conclusión

Hasta el momento, **las APIs de usuarios, productos y compras**, así como la ingesta de productos a Elasticsearch, cumplen con los requisitos básicos de un sistema multi-tenant. 

Las tareas restantes son:

- **Sincronización de compras en Elasticsearch**.
- **Mejoras en UI/UX del frontend**.

Una vez definidos estos requisitos y aprobado el diseño, podemos proceder con el paso "codea" para implementar los nuevos handlers y configuraciones en Serverless.
