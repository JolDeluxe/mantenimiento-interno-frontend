# ESTRUCTURA FÍSICA Y LÓGICA DEL MONOREPO

Este documento describe la distribución de carpetas y archivos en el proyecto, reflejando el ordenamiento técnico real del monorepositorio.

---

## 1. Directorio Raíz

El proyecto agrupa las aplicaciones en un único monorepositorio:
* `/backend`: API Gateway con Express, TypeScript y Bun.
* `/mantenimiento-interno-frontend`: Aplicación cliente React 19 para personal de mantenimiento.
* `/mantenimiento-publico-frontend`: Aplicación cliente React 19 para el reporte público de incidencias.
* `/docs`: Manuales y especificaciones arquitectónicas del sistema.

---

## 2. Estructura de `/backend`

```text
backend/
├── prisma/
│   ├── schema.prisma       # Esquema y relaciones de la Base de Datos (MySQL)
│   └── seed.ts             # Inicializador de datos de prueba
├── src/
│   ├── db.ts               # Singleton de conexión de Prisma Client
│   ├── index.ts            # Punto de entrada Express y WebSocket
│   ├── middlewares/        # Validadores, autenticación JWT y RBAC
│   ├── routes/             # Ruteadores Express expuestos
│   └── modules/            # Dominios encapsulados (auth, usuarios, tickets, etc.)
│       └── tickets/
│           ├── zod/
│           │   └── index.ts # Esquema estricto de filtros y payloads
│           ├── create/     # Controladores especializados de creación
│           ├── helper.ts   # Inyección de banderas DTO y construcciones where
│           └── 01_list.ts  # Listador con in-memory sort para HOY
```

---

## 3. Estructura de `/mantenimiento-interno-frontend`

El cliente React implementa una arquitectura limpia y una estandarización de utilidades que elimina la redundancia y librerías obsoletas (como moment o utilitarios dispersos):

```text
mantenimiento-interno-frontend/src/
├── main.jsx                 # Montaje en el DOM
├── index.css                # Diccionario de marca y directivas Tailwind @theme
├── lib/                     # Clientes de API e IndexedDB
│   ├── axios.js             # Interceptor de red y cola offline
│   ├── date-format.js       # Única librería autorizada de formateo (America/Mexico_City)
│   └── date-utils.js        # Utilerías auxiliares de rangos y semanas
├── stores/                  # Zustand (auth-store, sync-store)
├── features/                # Características de negocio (Tickets, Maquinaria, etc.)
│   ├── tickets/
│   │   ├── api/             # Conexión directa a API REST
│   │   ├── hooks/           # use-tickets.js (Carga, mutaciones y caché local)
│   │   ├── pages/           # Controladores de pantalla (TicketsHoyPage, etc.)
│   │   └── views/           # UI pura Desktop/Mobile
│   └── hoy/
│       ├── pages/           # Controladores de pantalla (HoyPage, etc.)
│       ├── views/           # Vistas Desktop/Mobile de la sección diaria
│       └── components/      # Componentes internos de la sección diaria
│           ├── common/      # Filtros, modales de detalles/estado comunes
│           ├── hoy-actividades/  # Componentes dedicados para Actividades generales
│           └── hoy-mantenimientos/ # Componentes dedicados para Mantenimientos de Maquinaria
```

> [!NOTE]
> Se han eliminado librerías y utilitarios paralelos de fechas (ej. en `src/utils/date-format.js`) para obligar a que todo el formateo de visualización se sirva centralizadamente desde `src/lib/date-format.js`.
