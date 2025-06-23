# 📋 Guía de Uso - Serverless.yml Maestro Multi-Tenant

## 🎯 Qué incluye el serverless.yml principal

El archivo `serverless.yml` en la raíz del proyecto es un **configurador maestro** que maneja la arquitectura multi-tenant:

### ✨ **Características principales:**

1. **🏗️ Recursos compartidos globales**
   - Tablas DynamoDB con estructura multi-tenant
   - S3 Buckets para data lake y frontend
   - Base de datos Glue para análisis cross-tenant
   - Elasticsearch cluster con índices por tenant
   - IAM roles con permisos granulares

2. **🔧 Variables de entorno centralizadas**
   - Nombres de tablas DynamoDB (PK/SK structure)
   - URLs de Elasticsearch por tenant
   - Configuración de buckets S3
   - Variables de proyecto y stage

3. **🏢 Configuración Multi-Tenant**
   - Estructura de claves primarias compuestas
   - Aislamiento de datos por tenant_id
   - Índices optimizados para consultas tenant-specific
   - Streams DynamoDB para ingesta en tiempo real

4. **🚀 Script de deployment automático**
   - Creación de tablas con estructura multi-tenant
   - Configuración de GSI para consultas eficientes
   - Setup de Elasticsearch con índices por tenant
   - Validación de aislamiento de datos

5. **📊 Función Lambda para Data Lake**
   - Procesamiento por tenant_id
   - Particionado automático por tenant
   - Análisis cross-tenant con Athena
   - Logs segregados por tenant

## 🏢 Configuración Multi-Tenant

### Estructura de Tablas DynamoDB

```yaml
# En serverless.yml maestro
resources:
  Resources:
    # Tabla Usuarios: PK = tenant_id#user_id, SK = email
    UsuariosTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: t_usuarios
        AttributeDefinitions:
          - AttributeName: PK
            AttributeType: S
          - AttributeName: SK
            AttributeType: S
          - AttributeName: email
            AttributeType: S
        KeySchema:
          - AttributeName: PK
            KeyType: HASH
          - AttributeName: SK
            KeyType: RANGE
        GlobalSecondaryIndexes:
          - IndexName: EmailIndex
            KeySchema:
              - AttributeName: email
                KeyType: HASH
            Projection:
              ProjectionType: ALL
            BillingMode: PAY_PER_REQUEST
        BillingMode: PAY_PER_REQUEST

    # Tabla Productos: PK = tenant_id, SK = producto#<codigo>
    ProductosTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: t_productos
        AttributeDefinitions:
          - AttributeName: PK
            AttributeType: S
          - AttributeName: SK
            AttributeType: S
        KeySchema:
          - AttributeName: PK
            KeyType: HASH
          - AttributeName: SK
            KeyType: RANGE
        StreamSpecification:
          StreamViewType: NEW_AND_OLD_IMAGES
        BillingMode: PAY_PER_REQUEST

    # Tabla Compras: PK = tenant_id#usuario_id, SK = compra#<compra_id>
    ComprasTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: t_compras
        AttributeDefinitions:
          - AttributeName: PK
            AttributeType: S
          - AttributeName: SK
            AttributeType: S
        KeySchema:
          - AttributeName: PK
            KeyType: HASH
          - AttributeName: SK
            KeyType: RANGE
        StreamSpecification:
          StreamViewType: NEW_AND_OLD_IMAGES
        BillingMode: PAY_PER_REQUEST
```

## 🚀 Comandos de Deployment

### **Opción 1: Script automático completo (RECOMENDADO)**
```powershell
# Deployment completo para DEV con configuración multi-tenant
.\deploy-all.ps1 -Stage dev -MultiTenant

# Deployment completo para PROD con aislamiento empresarial
.\deploy-all.ps1 -Stage prod -MultiTenant

# Solo recursos compartidos multi-tenant
.\deploy-all.ps1 -Stage dev -OnlyResources -MultiTenant

# Crear tenant específico
.\deploy-all.ps1 -Stage dev -CreateTenant "tenant_123"
```

### **Opción 2: Serverless Framework directo**
```powershell
# Solo recursos compartidos del maestro
serverless deploy --stage dev

# Con variable específica
serverless deploy --stage dev --region us-west-2
```

### **Opción 3: Deployment manual paso a paso**
```powershell
# 1. Recursos compartidos
serverless deploy --stage dev

# 2. APIs en orden (usuarios debe ir primero)
cd api-usuarios && serverless deploy --stage dev && cd ..
cd api-productos && serverless deploy --stage dev && cd ..  
cd api-compras && serverless deploy --stage dev && cd ..
cd lambda-ingesta && serverless deploy --stage dev && cd ..

# 3. Frontend
cd frontend && npm run deploy:dev && cd ..
```

## 🔧 Variables disponibles

El serverless.yml maestro define estas variables que pueden usar todos los servicios:

### **Variables de entorno automáticas:**
- `PROJECT_NAME`: tienda-electronicos
- `STAGE`: dev/test/prod
- `REGION`: us-east-1 (por defecto)
- `USUARIOS_TABLE`: t_usuarios_{stage}
- `PRODUCTOS_TABLE`: t_productos_{stage}
- `COMPRAS_TABLE`: t_compras_{stage}
- `DATA_LAKE_BUCKET`: tienda-electronicos-data-lake-{stage}
- `FRONTEND_BUCKET`: tienda-electronicos-frontend-{stage}

### **Outputs exportados:**
- `tienda-electronicos-frontend-bucket-{stage}`
- `tienda-electronicos-frontend-url-{stage}`
- `tienda-electronicos-data-lake-bucket-{stage}`
- `tienda-electronicos-glue-database-{stage}`

## 📦 Estructura del deployment

```
1. serverless.yml (maestro)
   ├── Crea S3 buckets
   ├── Configura Glue Database
   ├── Define IAM roles globales
   └── Establece variables de entorno

2. api-usuarios/serverless.yml
   ├── Usa variables del maestro
   └── Crea tabla t_usuarios con streams

3. api-productos/serverless.yml  
   ├── Usa variables del maestro
   ├── Invoca función validar token
   └── Crea tabla t_productos con streams

4. api-compras/serverless.yml
   ├── Usa variables del maestro
   ├── Invoca función validar token
   └── Crea tabla t_compras con streams

5. lambda-ingesta/serverless.yml
   ├── Usa variables del maestro
   ├── Lee streams de DynamoDB
   └── Escribe a S3 y Elasticsearch
```

## 🎛️ Personalización

### **Cambiar region por defecto:**
Editar `custom.region` en serverless.yml maestro:
```yaml
custom:
  region: ${opt:region, 'us-west-2'}  # Cambiar aquí
```

### **Cambiar nombres de buckets:**
Editar `custom.frontendBuckets` en serverless.yml maestro:
```yaml
frontendBuckets:
  dev: mi-tienda-frontend-dev
  test: mi-tienda-frontend-test  
  prod: mi-tienda-frontend-prod
```

### **Agregar nuevo stage:**
```yaml
frontendBuckets:
  dev: ${self:custom.projectName}-frontend-dev
  test: ${self:custom.projectName}-frontend-test
  staging: ${self:custom.projectName}-frontend-staging  # Nuevo
  prod: ${self:custom.projectName}-frontend-prod
```

## 🛠️ Troubleshooting

### **Error: Stack ya existe**
```powershell
# Eliminar stack completo
serverless remove --stage dev

# Volver a desplegar
serverless deploy --stage dev
```

### **Error: Permisos IAM**
Verificar que AWS CLI está configurado con LabRole correcto:
```powershell
aws sts get-caller-identity
```

### **Error: JWT Secret no existe**
El script automático lo crea, pero manualmente:
```powershell
aws ssm put-parameter `
  --name "/api-usuarios/dev/jwt-secret" `
  --value "mi-secret-super-seguro" `
  --type "SecureString"
```

### **Error: Bucket ya existe**
Los nombres de S3 son globales. Cambiar en `custom.frontendBuckets`:
```yaml
frontendBuckets:
  dev: mi-nombre-unico-frontend-dev-12345
```

## 📊 Verificación del deployment

### **Verificar recursos creados:**
```powershell
# Listar buckets S3
aws s3 ls | findstr tienda-electronicos

# Verificar base de datos Glue  
aws glue get-database --name tienda_electronicos_dev

# Listar funciones Lambda
aws lambda list-functions --query 'Functions[?contains(FunctionName, `tienda-electronicos`)].FunctionName'
```

### **Verificar frontend:**
```
http://tienda-electronicos-frontend-dev.s3-website-us-east-1.amazonaws.com
```

## 🎉 Ventajas del serverless.yml maestro

✅ **Deployment unificado** - Un solo comando para todo  
✅ **Variables centralizadas** - No más URLs hardcodeadas  
✅ **Orden correcto** - Script maneja dependencias automáticamente  
✅ **Recursos compartidos** - S3, Glue, IAM configurados una vez  
✅ **Multi-stage** - dev/test/prod con misma configuración  
✅ **Troubleshooting** - Logs y validaciones integradas  
✅ **Escalable** - Fácil agregar nuevos servicios

¡Ahora puedes desplegar toda la plataforma con un solo comando! 🚀
