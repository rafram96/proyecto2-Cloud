# 🛒 Tienda Electrónicos - Arquitectura Serverless Multi-Tenant

## 📋 Descripción del Proyecto
Solución completa serverless para una tienda de productos electrónicos (tipo Amazon) con backend multi-tenant, frontend React con TypeScript, e ingesta de datos en tiempo real usando AWS Lambda, DynamoDB, S3, Elasticsearch y Athena. Proyecto con deployment automatizado multi-stage y documentación completa.

## 🏗️ Arquitectura de Microservicios

### Estructura Multi-Tenant de Base de Datos

#### **Tabla: p_usuarios-${stage}**
- **PK**: `email` (String) - Correo electrónico del usuario
- **SK**: `tenant_id` (String) - Identificador del tenant
- **Campos**: `user_id`, `nombre`, `password` (SHA256)
- **Streams**: Habilitados para auditoría

#### **Tabla: p_productos-${stage}**
- **PK**: `tenant_id` (String) - Identificador del tenant
- **SK**: `PRODUCTO#<código>` (String) - Clave del producto
- **GSI**: `TenantCategoriaIndex` (tenant_id + categoria)
- **Campos**: `codigo`, `nombre`, `descripcion`, `precio`, `categoria`, `stock`, `imagen_url`, `tags`, `activo`, timestamps
- **Streams**: Habilitados para sync con Elasticsearch

#### **Tabla: p_compras-${stage}**
- **PK**: `tenant_id` (String) - Identificador del tenant
- **SK**: `COMPRA#<compra_id>` (String) - Clave de la compra
- **GSI**: `UserComprasIndex` (tenant_id + user_id), `FechaComprasIndex` (tenant_id + fecha_compra)
- **Campos**: `compra_id`, `user_id`, `productos`, `total`, `metodo_pago`, `fecha_compra`, `estado`
- **Streams**: Habilitados para ingesta en S3/Athena

### 1. API Usuarios (Python 3.13)
- **Lenguaje**: Python 3.13
- **Autenticación**: JWT con PyJWT (expiración 1 hora)
- **Token**: Generado en `/auth/registro` y `/auth/login`, incluye `tenant_id` y `user_id`
- **Validación**: Centralizada en `/auth/validar` con verificación de expiración
- **Base de datos**: DynamoDB (`p_usuarios-${stage}`)
- **Hash**: SHA256 para contraseñas con `hashlib`
- **Endpoints**:
  - `POST /auth/registro` – Crear usuario y generar JWT
  - `POST /auth/login` – Iniciar sesión y obtener JWT
  - `GET /auth/validar` – Validar JWT y obtener payload

### 2. API Productos (Node.js 18.x)
- **Lenguaje**: Node.js 18.x
- **Autenticación**: JWT con `jsonwebtoken` y middleware `requireAuth`
- **Token**: Se envía en header `Authorization: Bearer <token>`
- **Secret**: Comparte `JWT_SECRET` con API Usuarios
- **Base de datos**: DynamoDB (`p_productos-${stage}`)
- **Streams**: Habilitados para CDC hacia Elasticsearch
- **S3**: Bucket `imagenes-productos-${stage}` para almacenar imágenes
- **Endpoints protegidos** (requieren JWT válido):
  - `POST /productos/crear` - Crear producto con validación multi-tenant
  - `POST /productos/listar` - Listar productos paginados (filtros por categoría)
  - `POST /productos/buscar` - Buscar productos por nombre/descripción
  - `POST /productos/actualizar` - Actualizar producto existente
  - `POST /productos/eliminar` - Soft delete de producto
  - `POST /productos/upload-image` - Subir imagen a S3
  - `POST /productos/search` - Búsqueda avanzada con Elasticsearch
  - `POST /productos/autocomplete` - Autocompletado de productos

### 3. API Compras (Python 3.12)
- **Lenguaje**: Python 3.12
- **Autenticación**: JWT protegido (valida token con API Usuarios)
- **Base de datos**: DynamoDB (`p_compras-${stage}`) + Streams
- **S3**: Bucket `compras-data-${stage}` para data lake
- **Endpoints**:
  - `POST /compras` - Crear nueva compra
  - `GET /compras` - Listar compras del usuario autenticado
  - `GET /compras/{compra_id}` - Obtener detalles de compra específica

## 🔄 Ingesta de Datos (CDC - Change Data Capture)

### Lambda Sync Elasticsearch (api-productos)
- **Trigger**: DynamoDB Streams de `p_productos-${stage}`
- **Destino**: Elasticsearch (índices por tenant_id)
- **Funcionalidad**: Indexa productos para búsqueda fuzzy y autocompletado
- **Índices**: `productos_{tenant_id}` con mapping optimizado
- **Operaciones**: INSERT, MODIFY, REMOVE sincronizadas en tiempo real

### Lambda Compras Stream (api-compras)
- **Trigger**: DynamoDB Streams de `p_compras-${stage}`
- **Destino**: S3 + AWS Glue Data Catalog
- **Funcionalidad**: Almacena compras en JSON/CSV para análisis con Athena
- **Estructura**: Particionado por `year/month/day/tenant_id`
- **Formatos**: JSON (análisis detallado) + CSV (agregaciones rápidas)

## 🖥️ Frontend (React 18 + TypeScript)
- **Framework**: React 18 con TypeScript y Vite
- **Styling**: Tailwind CSS con diseño moderno responsive
- **Hosting**: S3 Static Website + CloudFront (opcional)
- **Autenticación**: JWT con localStorage y context API
- **Routing**: React Router DOM v7
- **Funcionalidades**:
  - Sistema de autenticación completo (registro/login)
  - CRUD productos con interfaz intuitiva
  - Búsqueda en tiempo real con autocompletado
  - Carrito de compras con persistencia local
  - Historial de compras por usuario
  - Selector de tenant multi-empresa
  - Modo oscuro/claro (ThemeToggle)
  - Componentes reutilizables con TypeScript

### Estructura del Frontend:
```
src/
├── components/           # Componentes reutilizables
│   ├── Navbar.tsx       # Navegación principal
│   ├── ProductCard.tsx  # Tarjeta de producto
│   ├── SearchBar.tsx    # Búsqueda con autocompletado
│   ├── FilterSidebar.tsx # Filtros de productos
│   ├── Pagination.tsx   # Paginación
│   └── ThemeToggle.tsx  # Alternador tema
├── pages/               # Páginas principales
│   ├── Home.tsx         # Página inicial
│   ├── Login.tsx        # Autenticación
│   ├── Search.tsx       # Búsqueda de productos
│   ├── ProductDetail.tsx # Detalles del producto
│   ├── Mycart.tsx       # Carrito de compras
│   └── Myorders.tsx     # Historial de compras
├── contexts/            # Context API
│   ├── AuthContext.jsx  # Estado de autenticación
│   └── CartContext.tsx  # Estado del carrito
├── services/            # APIs y servicios
│   ├── api.ts           # Cliente HTTP base
│   ├── authService.ts   # Servicios de auth
│   ├── productService.ts # Servicios de productos
│   └── comprasService.ts # Servicios de compras
└── types/               # Tipos TypeScript
    ├── product.tsx      # Tipos de producto
    └── FilterOptions.tsx # Tipos de filtros
```

## 🚀 Deployment Automatizado

### Scripts de Deployment Disponibles:

#### 1. Deployment Individual por API
```bash
# API Usuarios
./scripts/deploy-usuarios.sh --stage prod

# API Productos  
./scripts/deploy-productos.sh --stage test

# API Compras
./scripts/deploy-compras.sh --stage dev
```

#### 2. Deployment Completo Multi-Stage
```bash
# Deployment completo en stage específico
./scripts/full-redeploy.sh --stage test

# Con clonado de repositorio
./scripts/full-redeploy.sh --stage prod --clone
```

#### 3. Scripts de Utilidad
```bash
# Verificar directorios
./scripts/check-dirs.sh

# Clonar repositorio fresco
./scripts/clone.sh
```

### Características de los Scripts:
- ✅ **Validación de stages**: Solo permite dev, test, prod
- ✅ **Logs detallados**: Cada deployment genera logs en `~/logs/`
- ✅ **Error handling**: Detección específica de errores S3, permisos, etc.
- ✅ **Output en tiempo real**: Muestra progreso del deployment
- ✅ **Eliminación automática**: Remove stack antes de redeploy
- ✅ **Validación de dependencias**: Verifica layers y packages


## 🔐 Seguridad Implementada

- ✅ **JWT con expiración de 1 hora** - Tokens seguros con PyJWT/jsonwebtoken
- ✅ **Hash SHA256 para contraseñas** - Sin almacenamiento de texto plano
- ✅ **Multi-tenancy estricto** - Estructura PK/SK optimizada por tenant
- ✅ **Aislamiento de datos** - Imposible acceso cross-tenant accidental
- ✅ **Validación centralizada** - Middleware `requireAuth` en todos los endpoints
- ✅ **Roles IAM restrictivos** - LabRole con principio de menor privilegio
- ✅ **CORS configurado** - Headers apropiados para frontend
- ✅ **Soft delete** - No eliminación física de productos
- ✅ **Validación de entrada** - Sanitización en todos los endpoints
- ✅ **Headers de seguridad** - Authorization, X-Tenant-Id obligatorios

## 🏢 Arquitectura Multi-Tenant

### Estrategia de Aislamiento:
- **Nivel de Fila**: `tenant_id` como PK en todas las tablas
- **Claves Compuestas**: Estructura PK/SK que garantiza aislamiento
- **Consultas Seguras**: Filtros automáticos por tenant en todas las queries
- **Escalabilidad**: Distribución automática de carga por tenant

### Ventajas del Diseño:
- 🔒 **Seguridad**: Datos completamente aislados a nivel de partición
- ⚡ **Performance**: Hot partitions por tenant activo
- 💰 **Costo**: Recursos compartidos eficientemente
- 🔧 **Mantenimiento**: Una sola infraestructura para todos los tenants
- 📈 **Escalabilidad**: Nuevos tenants sin cambios de código


### Tenants de Ejemplo:
```javascript
// Tenants configurados en frontend
const TENANTS = {
  'tenant_001': { name: 'TechStore PE', theme: 'blue' },
  'tenant_002': { name: 'ElectroMax', theme: 'green' },
  'tenant_003': { name: 'GadgetWorld', theme: 'purple' }
}
```

## 📊 Análisis de Datos con Athena
### Base de Datos: `tienda_electronicos_${stage}`
#### Tablas Disponibles:
1. **`compras_json`** - Datos completos en formato JSON
2. **`compras_csv`** - Datos agregados para queries rápidas


### Queries SQL Implementadas:
#### 1. Total de ventas por tenant (últimos 30 días)
```sql
SELECT 
    tenant_id,
    COUNT(*) as total_compras,
    SUM(total) as total_ventas,
    AVG(total) as promedio_por_compra,
    MIN(total) as compra_minima,
    MAX(total) as compra_maxima
FROM "tienda_electronicos_dev"."compras_csv"
WHERE year = '2024' AND month >= '11' AND total > 0
GROUP BY tenant_id
ORDER BY total_ventas DESC;
```

#### 2. Análisis de tendencias por método de pago
```sql
SELECT 
    metodo_pago,
    tenant_id,
    year, month,
    COUNT(*) as numero_transacciones,
    SUM(total) as total_ventas,
    ROUND(AVG(total), 2) as ticket_promedio
FROM "tienda_electronicos_dev"."compras_csv"
WHERE total > 0
GROUP BY metodo_pago, tenant_id, year, month
ORDER BY total_ventas DESC;
```

#### 3. Productos más vendidos con análisis de rentabilidad
```sql
SELECT 
    p.producto_nombre,
    p.tenant_id,
    COUNT(*) as veces_vendido,
    SUM(p.cantidad) as unidades_totales,
    SUM(p.subtotal) as ingresos_totales,
    ROUND(AVG(p.precio_unitario), 2) as precio_promedio
FROM "tienda_electronicos_dev"."compras_json" c
CROSS JOIN UNNEST(c.productos) AS t(p)
WHERE c.total > 0
GROUP BY p.producto_nombre, p.tenant_id
HAVING COUNT(*) >= 2
ORDER BY ingresos_totales DESC
LIMIT 20;
```

### Configuración de Athena:
- **Formato de datos**: Parquet optimizado para consultas
- **Particionado**: Por año/mes/día/tenant_id para performance

## 🛠️ Tecnologías Utilizadas

### Backend:
- **AWS Lambda** (Python 3.13, Python 3.12, Node.js 18.x)
- **API Gateway** (REST APIs con CORS completo)
- **DynamoDB** (NoSQL con Streams habilitados en todas las tablas)
- **DynamoDB Streams** (CDC en tiempo real)
- **AWS S3** (Almacenamiento de imágenes y data lake)
- **AWS Glue** (Data Catalog para Athena)
- **Amazon Athena** (Análisis SQL)
- **Elasticsearch** (Búsqueda y autocompletado)

### Frontend:
- **React 18** (Hooks, Context API, Suspense)
- **TypeScript** (Tipado estático completo)
- **Vite** (Build tool moderno)
- **Tailwind CSS** (Styling utility-first)
- **React Router DOM v7** (Enrutamiento)
- **Axios** (Cliente HTTP)
- **Lucide React** (Iconografía)




## 🚧 Estado del Proyecto

### ✅ Completado (100%):
- [x] 3 Microservicios serverless (Python + Node.js)
- [x] Multi-tenancy completo con aislamiento estricto
- [x] JWT con 1 hora de expiración y validación centralizada
- [x] DynamoDB Streams habilitados para CDC
- [x] Ingesta en tiempo real (DynamoDB → Elasticsearch + S3)
- [x] Frontend React con TypeScript funcional
- [] 3 Queries SQL para Athena con análisis de negocio
- [x] Deployment automatizado multi-stage
- [x] Scripts de automation completos
- [x] Documentación técnica completa

---

## 🏆 Cumplimiento de Requisitos del Proyecto

✅ **Arquitectura Serverless Multi-Tenant**: Implementada con DynamoDB particionado por tenant  
✅ **3 Microservicios**: api-usuarios (Python), api-productos (Node.js), api-compras (Python)  
✅ **JWT con expiración**: 1 hora con validación centralizada  
✅ **DynamoDB Streams**: Habilitados para CDC en tiempo real  
✅ **Ingesta de Datos**: DynamoDB → Elasticsearch + S3 automática  
✅ **Deployment Automatizado**: Scripts multi-stage con error handling  
✅ **Documentación Completa**: README, docs técnicos y APIs documentadas  

🎉 **¡Proyecto E-commerce Serverless Multi-Tenant 100% Completado!**
