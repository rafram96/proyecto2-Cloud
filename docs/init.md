# 📘 Documentación Frontend - Integración con Backend

Este documento detalla las páginas/componentes del frontend, los endpoints que deben consumir y las funcionalidades clave para cada sección de la aplicación.

---

## 🔐 1. Página de Login

**Ruta:** `/login`

### Componentes:
- Formulario de ingreso (`tenant_id`, `email`, `password`)
- Botón "Iniciar sesión"
- Gestión de errores (credenciales inválidas, campos vacíos)

### Funcionalidades:
- Enviar credenciales al backend
- Recibir y almacenar el JWT en localStorage o context
- Redirigir al dashboard o gestión de productos

### Endpoints:
- `POST /usuarios/login`
  - Payload: `{ "tenant_id": "abc", "email": "user@mail.com", "password": "123456" }`
  - Respuesta: `{ "token": "JWT_TOKEN", "user_id": "xyz", "tenant_id": "abc" }`

- `POST /usuarios/validar`
  - Header: `Authorization: Bearer JWT_TOKEN`
  - Respuesta: `{ "tenant_id": "abc", "user_id": "xyz" }`

---

## 🏢 2. Página de Selección de Tenant

**Ruta:** `/tenant` o como dropdown fijo en el header (modo demo)

### Componentes:
- Dropdown de selección de `tenant_id`

### Funcionalidades:
- Cambiar visualización entre tenants (solo modo demo o multi-tenant)
- Guardar selección en `TenantContext`

### Endpoints:
- No requiere, `tenant_id` se extrae del token

---

## 📦 3. Página de Gestión de Productos

**Ruta:** `/productos`

### Componentes:
- Tabla/listado de productos
- Filtros: por `categoría`, por texto (`nombre`, `tags`)
- Botones: “Crear nuevo”, “Editar”, “Eliminar” (soft delete)

### Funcionalidades:
- Cargar productos paginados
- Aplicar filtros dinámicos
- Navegar entre páginas (`limit`, `lastKey`)
- **Popup modal** para crear y editar productos en la misma vista

### Modal de Producto:
- **Crear/Editar Producto**:
  - Formulario con campos: `nombre`, `descripción`, `precio`, `categoría`, `stock`, `tags`
  - Validaciones de campos y mostración de errores
  - Envío a endpoints de creación o actualización según el modo

### Endpoints:
- `POST /productos/listar`
  - Payload: `{ "limit": 10, "lastKey": null, "categoria": "ropa", "busqueda": "polo" }`

- `POST /productos/buscar`
  - Payload: `{ "codigo": "123", "nombre": "polo", "categoria": "ropa" }`

- `POST /productos/crear`
  - Payload: `{ nombre, descripcion, precio, categoria, stock, tags }

- `POST /productos/actualizar`
  - Payload: `{ producto_id, campos_a_actualizar }

- `POST /productos/eliminar`
  - Payload: `{ producto_id }

---

## 🛒 4. Página Carrito y Checkout

**Ruta:** `/carrito`

### Componentes:
- Lista de productos en carrito
- Selector de cantidades
- Campo de dirección
- Selección de método de pago
- Botón “Realizar compra”

### Funcionalidades:
- Gestionar productos en el carrito (`CartContext`)
- Confirmar compra y enviar datos
- Vaciar carrito al finalizar

### Endpoint:
- `POST /compras/crear`
  - Payload:
    ```json
    {
      "productos": [
        { "producto_id": "abc123", "cantidad": 2 }
      ],
      "direccion": "Av. Lima 123",
      "metodo_pago": "tarjeta"
    }
    ```

---

## 📜 5. Página Historial de Compras

**Ruta:** `/compras`

### Componentes:
- Tabla de compras realizadas
- Detalles de productos por compra
- Navegación paginada

### Funcionalidades:
- Mostrar historial de compras del usuario actual
- Soportar paginación (`limit`, `lastKey`)

### Endpoint:
- `POST /compras/listar`
  - Payload:
    ```json
    {
      "limit": 10,
      "lastKey": null
    }
    ```

---

## 📦 Infraestructura Backend (resumen para frontend dev)

- **Autenticación JWT** → Todos los endpoints requieren enviar el token:  
  `Authorization: Bearer <TOKEN>`
- **Multi-tenant** → Toda la lógica se aísla por `tenant_id`
- **Paginación** → Para productos y compras se usa `limit` y `lastKey` como token de continuación

---

## ⚙️ Contextos React ya disponibles

- `AuthContext` → Guarda token, user_id, login/logout  
- `TenantContext` → Guarda tenant_id actual  
- `CartContext` → Guarda carrito actual del usuario

---

## 🧭 Navegación Sugerida

| Página                | Ruta         | Requiere Login |
|-----------------------|--------------|----------------|
| Login                 | `/login`     | ❌             |
| Selección de Tenant   | `/tenant`    | ✅             |
| Gestión de Productos  | `/productos` | ✅             |
| Carrito/Checkout      | `/carrito`   | ✅             |
| Historial de Compras  | `/compras`   | ✅             |

---
