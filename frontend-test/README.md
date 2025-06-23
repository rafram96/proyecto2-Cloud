# Frontend Test para API Usuarios

Frontend básico con Vite + React para probar la API de usuarios.

## Estructura del proyecto

```
frontend-test/
├── src/
│   ├── components/     # Componentes reutilizables
│   │   └── Header.jsx
│   ├── pages/         # Páginas de la aplicación
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Dashboard.jsx
│   ├── services/      # Servicios para API
│   │   └── api.js
│   ├── assets/        # CSS y recursos estáticos
│   │   └── index.css
│   ├── App.jsx
│   └── main.jsx
├── .env               # Variables de entorno
├── package.json
└── vite.config.js
```

## Instalación y uso

1. Instalar dependencias:
```bash
npm install
```

2. Configurar la URL de la API en `.env`:
```
VITE_API_BASE_URL=http://dominio.com/dev
```

3. Ejecutar en modo desarrollo:
```bash
npm run dev
```

4. Abrir en el navegador: http://localhost:3000

## Funcionalidades implementadas

- ✅ **Registro de usuarios** (`/register`)
- ✅ **Login de usuarios** (`/login`) 
- ✅ **Dashboard con validación de token** (`/dashboard`)
- ✅ **Header con navegación y logout**
- ✅ **Manejo de errores y estados de carga**
- ✅ **Almacenamiento de token en localStorage**

## Endpoints probados

- `POST /usuarios/crear` - Registro
- `POST /usuarios/login` - Login  
- `GET /usuarios/validar` - Validación de token

## Variables de entorno

El archivo `.env` debe contener:
```
VITE_API_BASE_URL=http://dominio.com/dev
```

Si tu API está en `http://dominio.com/dev/usuarios/login`, la variable debe ser `http://dominio.com/dev` (sin la ruta específica del endpoint).

## Próximas funcionalidades

- 🚧 Crear usuarios admin
- 🚧 Gestión de tenants  
- 🚧 Integración con API de productos
- 🚧 Mejoras en UI/UX
