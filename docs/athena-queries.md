# 📊 Queries SQL para Amazon Athena

## Configuración inicial

Antes de ejecutar las queries, asegúrate de que las tablas estén creadas en Glue Catalog mediante el deployment de `lambda-ingesta`.

### 1. Configurar ubicación de resultados de Athena
```sql
-- Ejecutar este comando en Athena Workbench primero
-- Reemplaza 'tu-bucket-resultados' con el bucket real
CREATE DATABASE IF NOT EXISTS athena_results_db;
```

---

## 🔍 Query 1: Total de ventas por tenant (últimos 30 días)

```sql
SELECT 
    tenant_id,
    COUNT(*) as total_compras,
    SUM(total) as total_ventas,
    AVG(total) as promedio_por_compra,
    MIN(total) as compra_minima,
    MAX(total) as compra_maxima
FROM "tienda_electronicos_dev"."compras_csv"
WHERE 
    year = '2024' 
    AND month >= '11'  -- Últimos meses
    AND total > 0
GROUP BY tenant_id
ORDER BY total_ventas DESC;
```

**Propósito**: Analizar el rendimiento de ventas por tenant para identificar los clientes más valiosos.

---

## 📈 Query 2: Análisis de tendencias de compras por método de pago

```sql
SELECT 
    metodo_pago,
    tenant_id,
    year,
    month,
    COUNT(*) as numero_transacciones,
    SUM(total) as total_ventas,
    ROUND(AVG(total), 2) as ticket_promedio
FROM "tienda_electronicos_dev"."compras_csv"
WHERE 
    year IN ('2024')
    AND estado = 'confirmada'
GROUP BY metodo_pago, tenant_id, year, month
ORDER BY year, month, total_ventas DESC;
```

**Propósito**: Identificar preferencias de pago por tenant y detectar tendencias temporales.

---

## 🛒 Query 3: Análisis detallado de productos más vendidos

```sql
WITH productos_expandidos AS (
    SELECT 
        compra_id,
        tenant_id,
        total as total_compra,
        created_at,
        year,
        month,
        day,
        producto.codigo as producto_codigo,
        producto.nombre as producto_nombre,
        producto.precio_unitario,
        producto.cantidad,
        producto.subtotal
    FROM "tienda_electronicos_dev"."compras_json"
    CROSS JOIN UNNEST(productos) AS t(producto)
    WHERE 
        year = '2024'
        AND estado = 'confirmada'
),
ranking_productos AS (
    SELECT 
        tenant_id,
        producto_codigo,
        producto_nombre,
        SUM(cantidad) as total_unidades_vendidas,
        COUNT(DISTINCT compra_id) as numero_compras,
        SUM(subtotal) as total_ingresos,
        ROUND(AVG(precio_unitario), 2) as precio_promedio,
        ROW_NUMBER() OVER (PARTITION BY tenant_id ORDER BY SUM(cantidad) DESC) as ranking
    FROM productos_expandidos
    GROUP BY tenant_id, producto_codigo, producto_nombre
)
SELECT 
    tenant_id,
    ranking,
    producto_codigo,
    producto_nombre,
    total_unidades_vendidas,
    numero_compras,
    total_ingresos,
    precio_promedio,
    ROUND(total_ingresos / total_unidades_vendidas, 2) as ingreso_por_unidad
FROM ranking_productos
WHERE ranking <= 10  -- Top 10 productos por tenant
ORDER BY tenant_id, ranking;
```

**Propósito**: Identificar los productos más populares por tenant y analizar su rentabilidad.

---

## 📊 Queries adicionales para análisis avanzado

### Query 4: Análisis de estacionalidad (por día de la semana)
```sql
SELECT 
    tenant_id,
    EXTRACT(DOW FROM date_parse(created_at, '%Y-%m-%dT%H:%i:%s')) as dia_semana,
    CASE EXTRACT(DOW FROM date_parse(created_at, '%Y-%m-%dT%H:%i:%s'))
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Lunes'
        WHEN 2 THEN 'Martes'
        WHEN 3 THEN 'Miércoles'
        WHEN 4 THEN 'Jueves'
        WHEN 5 THEN 'Viernes'
        WHEN 6 THEN 'Sábado'
    END as nombre_dia,
    COUNT(*) as total_compras,
    SUM(total) as total_ventas,
    ROUND(AVG(total), 2) as ticket_promedio
FROM "tienda_electronicos_dev"."compras_csv"
WHERE 
    year = '2024'
    AND estado = 'confirmada'
GROUP BY tenant_id, EXTRACT(DOW FROM date_parse(created_at, '%Y-%m-%dT%H:%i:%s'))
ORDER BY tenant_id, dia_semana;
```

### Query 5: Cohort de clientes (frecuencia de compra)
```sql
WITH compras_por_usuario AS (
    SELECT 
        tenant_id,
        usuario_id,
        COUNT(*) as total_compras,
        SUM(total) as total_gastado,
        MIN(date_parse(created_at, '%Y-%m-%dT%H:%i:%s')) as primera_compra,
        MAX(date_parse(created_at, '%Y-%m-%dT%H:%i:%s')) as ultima_compra
    FROM "tienda_electronicos_dev"."compras_csv"
    WHERE estado = 'confirmada'
    GROUP BY tenant_id, usuario_id
)
SELECT 
    tenant_id,
    CASE 
        WHEN total_compras = 1 THEN 'Cliente de una compra'
        WHEN total_compras BETWEEN 2 AND 5 THEN 'Cliente ocasional'
        WHEN total_compras BETWEEN 6 AND 10 THEN 'Cliente frecuente'
        ELSE 'Cliente VIP'
    END as segmento_cliente,
    COUNT(*) as numero_clientes,
    ROUND(AVG(total_compras), 2) as compras_promedio,
    ROUND(AVG(total_gastado), 2) as gasto_promedio,
    ROUND(SUM(total_gastado), 2) as ingreso_total_segmento
FROM compras_por_usuario
GROUP BY tenant_id, 
    CASE 
        WHEN total_compras = 1 THEN 'Cliente de una compra'
        WHEN total_compras BETWEEN 2 AND 5 THEN 'Cliente ocasional'
        WHEN total_compras BETWEEN 6 AND 10 THEN 'Cliente frecuente'
        ELSE 'Cliente VIP'
    END
ORDER BY tenant_id, ingreso_total_segmento DESC;
```

---

## 📝 Instrucciones para ejecutar

1. **Abrir Amazon Athena** en la consola de AWS
2. **Seleccionar la base de datos**: `tienda_electronicos_dev` (o el stage correspondiente)
3. **Verificar las tablas disponibles**:
   - `compras_csv` - Para análisis rápidos y agregaciones
   - `compras_json` - Para análisis detallados de productos
4. **Ejecutar las queries** una por una
5. **Descargar resultados** en formato CSV si es necesario

## 🚀 Optimizaciones recomendadas

- **Particionamiento**: Las tablas ya están particionadas por `tenant_id`, `year`, `month`, `day`
- **Formato de datos**: Usar Parquet en lugar de JSON/CSV para mejor rendimiento
- **Compresión**: Habilitar compresión GZIP o Snappy
- **Indices**: Crear índices en Glue para columnas frecuentemente consultadas

## 📊 Casos de uso de negocio

1. **Dashboard ejecutivo**: Query 1 y 2 para métricas de alto nivel
2. **Gestión de inventario**: Query 3 para reabastecimiento
3. **Marketing**: Query 4 y 5 para campañas dirigidas
4. **Análisis financiero**: Todas las queries para reportes de rentabilidad
