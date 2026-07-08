# CUADRA MANTENIMIENTO - FILOSOFÍA CENTRAL Y FILOSOFÍA DE DISEÑO

Este documento establece las directrices arquitectónicas críticas y fundamentales del sistema de gestión de mantenimiento de planta. Todo desarrollo subsiguiente debe alinearse estrictamente a estas reglas.

---

## 1. Contexto General del Sistema
Plataforma de gestión operativa de mantenimiento (CUADRA) para planta de manufactura. Controla el ciclo de vida de tareas preventivas, correctivas y autónomas, tableros de control de KPIs e integraciones de notificaciones y PWA offline.
El sistema cuenta con 5 roles: `SUPER_ADMIN`, `JEFE_MTTO`, `COORDINADOR_MTTO`, `TECNICO`, y `CLIENTE_INTERNO`.

## 2. Tech Stack Estándar
* **Backend**: Bun (runtime) + Express + TypeScript + Prisma ORM + MySQL. Desplegado en Windows Server a través de PM2 con Cloudflare Tunnel.
* **Frontend**: React 19 (Vite) + JavaScript ES6+ (Sin TypeScript en cliente) + Tailwind CSS + Zustand + Socket.io Client + PWA (Workbox).

---

## 3. Ley de Hierro: Thin Frontend / Fat Backend

El sistema se rige bajo el principio arquitectónico de **Thin Frontend / Fat Backend**. El cliente es una terminal de renderizado declarativo y el servidor centraliza el 100% de la inteligencia de negocio.

### Backend (El Cerebro - Fat)
* **Reglas de Negocio Centralizadas**: Toda lógica de transición de estados (`isValidTransition`), control de flujos y cálculos temporales se procesa exclusivamente en el servidor.
* **Flags Booleanos Computados en el DTO**: Atributos como `isLate` (conclusión tardía), `isOverdue` (tarea vencida) y `perteneceAHoy` (tarea prioritaria para el día actual) son evaluados e inyectados por el backend en el DTO.
* **Validación de Capas**: Toda entrada de datos se sella y valida a nivel API utilizando esquemas Zod en [zod/index.ts](file:///C:/App/Joel/04_Proyecto_Mantenimiento/backend/src/modules/tickets/zod/index.ts).

### Frontend (La Terminal Reactiva - Thin)
* **Consumo Declarativo**: El cliente consume DTOs limpios y estructurados. Si una bandera está activa (`t.isOverdue === true`), la UI renderiza el estilo visual correspondiente (ej. fondo rojo) sin evaluar fechas ni calcular condiciones lógicas de negocio en los componentes React.
* **Filtrado en Base de Datos**: Queda terminantemente prohibido descargar colecciones masivas de datos (ej. mediante `limit: 5000`) para filtrar localmente en memoria. El frontend solo consume lo que el backend filtra de forma paginada y controlada mediante parámetros de query (`perteneceAHoy`, `venceManana`, etc.).

---

## 4. Ley de Reloj Único (`America/Mexico_City`)

Para erradicar desfases de días debido al uso de zonas horarias locales del navegador o del servidor, se establece:
* **Única Zona Horaria Permitida**: `America/Mexico_City` (GMT-6 en CST / GMT-5 en CDT).
* **Representación de Fechas**: Todas las comparaciones a nivel lógico y filtros de base de datos se normalizan usando strings ISO y transformaciones explícitas de huso horario a través de `toMXDateStr` en el backend y `@/lib/date-format.js` en el frontend.
* **Prohibición de Date locales**: Ningún componente frontend o backend debe instanciar `new Date()` sin mapear explícitamente su comportamiento al huso de Ciudad de México.