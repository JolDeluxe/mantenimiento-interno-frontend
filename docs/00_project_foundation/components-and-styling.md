# SISTEMA DE COMPONENTES Y DISEÑO VISUAL

Este documento define la estructura de estilos, la librería de componentes compartidos y el ecosistema Liquid Glass para dispositivos móviles.

---

## 1. index.css e Integración de Marca (Tailwind CSS)

El archivo `index.css` centraliza los tokens de diseño del proyecto mediante variables CSS definidas en el tema global. Esto asegura consistencia cromática y tipográfica en todas las pantallas.

### Principales Variables de Interfaz:
* **`--color-marca-primario`**: Slate oscuro principal (#0f172a).
* **`--color-marca-secundario`**: Azul operativo (#3b82f6).
* **`--color-marca-acento`**: Verde esmeralda para confirmaciones (#10b981).
* **`--font-sans`**: `'Work Sans'`, `'Inter'`, system-ui, sans-serif.

---

## 2. Consistencia Visual en Badges y Estados

Los badges de estado y prioridad consumen de forma declarativa las propiedades lógicas devueltas por el servidor, mapeando los colores e iconografías de forma inequívoca en [ticket-status-badge.jsx](file:///C:/App/Joel/04_Proyecto_Mantenimiento/mantenimiento-interno-frontend/src/features/tickets/components/historico/ticket-status-badge.jsx):

### A. Estados de Tarea:
* **`PENDIENTE`**: Gris (`bg-slate-50 text-slate-700 border-slate-200`). Icono `hourglass_empty`.
* **`ASIGNADA`**: Azul (`bg-blue-50 text-blue-700 border-blue-200`). Icono `person`.
* **`EN_PROGRESO`** / **`EN_PROCESO`**: Amarillo (`bg-amber-50 text-amber-700 border-amber-200`). Icono `play_arrow`.
* **`EN_PAUSA`**: Naranja (`bg-orange-50 text-orange-700 border-orange-200`). Icono `pause`.
* **`RESUELTO`**: Esmeralda (`bg-emerald-50 text-emerald-700 border-emerald-200`). Icono `check_circle`.
* **`RECHAZADO`**: Rojo (`bg-red-50 text-red-700 border-red-200`). Icono `cancel`.
* **`CANCELADA`**: Gris oscuro con tachado. Icono `block`.

### B. Badges de Alertas Temporales:
* **Atrasada (`t.isOverdue === true`)**:
  Badge con fondo rojo de advertencia `warning` con micro-animación de pulso, indicando visualmente al técnico que la tarea ha rebasado su fecha límite de resolución.
* **Entregada con Retraso (`t.isLate === true`)**:
  Badge complementario en color rojo neutral que aparece en tareas concluidas (`RESUELTO` / `CERRADO`) para advertir que el tiempo real de solución superó la fecha límite de vencimiento pactada originalmente.

---

## 3. Arquitectura del Ecosistema Liquid Glass (Móvil)

La interfaz móvil cuenta con un diseño de cristal líquido translúcido basado en desenfoque y refracción.

### Elementos Clave:
* **`glassBase('light' | 'primary' | 'dark')`**: Utilidad que aplica `backdropFilter: blur(12px)` con bordes semi-transparentes de color blanco o azul.
* **`GlassSheen`**: Capa superior que simula el reflejo de luz mediante degradados lineales.
* **Liquid Fabs y Pills**: Los botones de paginación (`LiquidPaginationPill`) y creación (`GlassFab`) flotan sobre el contenido fijándose en la parte inferior de la pantalla, adaptando su margen de manera fluida mediante z-index elevados.
