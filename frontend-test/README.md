# Multi-Tenant E-Commerce Frontend

Un frontend moderno desarrollado con React + TypeScript + Vite para un sistema de e-commerce multi-tenant con soporte completo para modo oscuro.

## 🌟 Características Principales

### 🎨 Sistema de Temas
- **Modo Oscuro/Claro**: Implementación completa con selección manual de tema
- **Detección Automática**: Respeta la preferencia del sistema operativo
- **Persistencia**: Guarda la preferencia del usuario en localStorage
- **Transiciones Suaves**: Animaciones fluidas entre temas
- **Paleta de Colores Consistente**: Variables CSS personalizadas para una experiencia uniforme

### 🏢 Multi-Tenancy
- **Nombre de Marca Dinámico**: El navbar muestra el nombre del tenant como marca
- **Fallback Inteligente**: Muestra 'ELEKTRA' si no hay usuario logueado
- **Contexto de Autenticación**: Manejo centralizado del estado de usuario

### 🔐 Autenticación y Seguridad
- **JWT Token Management**: Interceptores automáticos para requests
- **Rutas Protegidas**: Sistema de protección de rutas con ProtectedRoute
- **Login/Register**: Páginas de autenticación con validación

### 🛒 E-Commerce Features
- **Catálogo de Productos**: Tarjetas de productos con información completa
- **Búsqueda y Filtros**: Sistema de búsqueda por categorías
- **Carrito de Compras**: Funcionalidad de carrito (en desarrollo)
- **Órdenes**: Historial de órdenes del usuario

## 🎨 Implementación del Modo Oscuro

### Hook Personalizado (`useTheme`)
```typescript
const { theme, toggleTheme } = useTheme();
```

### Componente ThemeToggle
- Botón de cambio de tema con iconos de sol/luna
- Integrado en ambos navbars (NavbarAuth y Navbar)
- Accesible con aria-labels

### Configuración de Tailwind
```javascript
module.exports = {
  darkMode: 'class', // Habilita modo oscuro con clases
  // ...
}
```

### Variables CSS Personalizadas
Variables para modo claro y oscuro definidas en `index.css`:
- Fondos primarios, secundarios y terciarios
- Colores de texto y bordes
- Colores de acento y estado

### Clases Utilitarias
```css
.theme-transition { transition: background-color 0.3s ease, color 0.3s ease; }
.bg-theme-primary { background-color: var(--bg-primary); }
.text-theme-primary { color: var(--text-primary); }
```

## 🚀 Tecnologías Utilizadas

- **React 18** con TypeScript
- **Vite** para desarrollo y build
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **Axios** para requests HTTP
- **React Icons** para iconografía

## 📦 Instalación y Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build
```

## 🎯 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Navbar.tsx      # Navbar principal (usuarios logueados)
│   ├── NavbarAuth.tsx  # Navbar para login/register
│   ├── ThemeToggle.tsx # Selector de modo oscuro
│   ├── ProductCard.tsx # Tarjeta de producto
│   └── ...
├── contexts/           # Contextos de React
│   └── AuthContext.jsx # Contexto de autenticación
├── hooks/              # Hooks personalizados
│   └── useTheme.ts    # Hook para manejo de temas
├── pages/              # Páginas de la aplicación
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── ...
├── services/           # Servicios de API
│   ├── api.ts
│   └── productService.ts
└── types/              # Definiciones de tipos
```

## 🎨 Guía de Estilos para Modo Oscuro

### Convenciones de Colores

**Modo Claro:**
- Fondo principal: `bg-white`
- Texto principal: `text-black`
- Elementos secundarios: `bg-gray-50`

**Modo Oscuro:**
- Fondo principal: `dark:bg-gray-900`
- Texto principal: `dark:text-white`
- Elementos secundarios: `dark:bg-gray-800`

### Mejores Prácticas

1. **Siempre incluir ambos modos**: `bg-white dark:bg-gray-900`
2. **Usar transiciones**: Añadir `theme-transition` clase
3. **Contraste adecuado**: Verificar legibilidad en ambos temas
4. **Estados hover**: Definir hover para ambos modos
5. **Elementos interactivos**: Asegurar visibilidad en ambos temas

### Componentes con Soporte Completo

✅ **Implementados:**
- Navbar / NavbarAuth
- ThemeToggle
- Login / Register
- Home
- ProductCard
- CategoryButtons
- ShopNowButton

🔄 **En desarrollo:**
- Search / Filtros
- Cart / Checkout
- Product Details
- User Profile

## 🔧 Configuración del Tema

El sistema detecta automáticamente:
1. **Preferencia guardada** en localStorage
2. **Preferencia del sistema** (`prefers-color-scheme`)
3. **Fallback** a modo claro

La detección se ejecuta **antes** de que React cargue para evitar parpadeos.

## 📱 Responsive Design

El sistema de temas funciona en todos los tamaños de pantalla:
- **Mobile First**: Diseño optimizado para móviles
- **Tablet/Desktop**: Adaptación fluida a pantallas grandes
- **Touch Friendly**: Botones y controles accesibles en touch

## 🎯 Próximas Funcionalidades

- [ ] Temas personalizados por tenant
- [ ] Modo de alto contraste
- [ ] Configuración de preferencias avanzadas
- [ ] Animaciones de transición mejoradas
- [ ] Modo automático (cambia según hora del día)

---

*Frontend desarrollado como parte del proyecto Multi-Tenant E-Commerce con arquitectura serverless en AWS.*
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
