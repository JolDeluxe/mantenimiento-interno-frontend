# CONTEXTO DEL PROYECTO Y FLUJOS DE TRABAJO

Este documento describe el contexto operativo, los flujos en planta y las reglas de negocio del sistema de gestión de mantenimiento en la fábrica de manufactura de calzado Botas Cuadra.

---

## 1. Roles y Flujo de Piso de Planta

El sistema divide el control operativo en 5 roles con responsabilidades y alcances diferenciados:

### A. Cliente Interno (Supervisor de Producción / Operador)
* **Función**: Genera reportes de fallas o anomalías mecánicas en las líneas de producción (Kappa, Lambda, Sigma).
* **Flujo**: Registra un ticket asignando la máquina correspondiente. Si la anomalía es menor y el operador está capacitado bajo el modelo TPM (Mantenimiento Productivo Total), puede activar el flag de **Mantenimiento Autónomo**, lo que crea el ticket directamente en estado `RESUELTO` para auditoría histórica. De lo contrario, entra como `PENDIENTE` en la bandeja del taller.

### B. Técnico de Mantenimiento
* **Función**: Ejecutor de los trabajos preventivos, correctivos y de rutina en piso.
* **Flujo**: Visualiza en su pantalla principal las tareas asignadas para el día de hoy. Inicia la tarea (cambio a `EN_PROGRESO` registrando la hora de inicio), puede pausarla si falta refacción, y finalmente la reporta como `RESUELTA` detallando la nota técnica de las observaciones y reparaciones físicas aplicadas.

### C. Coordinador de Mantenimiento (Mando Medio)
* **Función**: Gestiona y distribuye la carga laboral del taller técnico de mantenimiento.
* **Flujo**: Asigna personal y define fechas de vencimiento para los tickets pendientes. Cuenta con una vista dual ("Equipo" / "Mis Tareas") para alternar entre sus propias asignaciones como técnico de apoyo y la visualización de la carga agregada de su equipo técnico.

### D. Jefe de Mantenimiento
* **Función**: Visión gerencial de fiabilidad, tiempos y costos.
* **Flujo**: Analiza indicadores críticos de eficiencia, aprueba o rechaza los mantenimientos reportados como resueltos y gestiona la reprogramación de tickets atrasados (backlog).

### E. Super Administrador
* **Función**: Soporte administrativo global, catálogos de maquinaria, usuarios, departamentos y overrides.

---

## 2. Indicadores de Maquinaria y Fiabilidad

La vista de expediente técnico de maquinaria (`MaquinaDetailModal`) e indicadores generales calcula:
1. **Fallas Reportadas**: Conteo acumulado de incidencias correctivas.
2. **Promedio de Solución (MTTR)**: Media de minutos requeridos para resolver averías correctivas.
3. **Tiempo en Reparación**: Sumatoria de la duración real de intervenciones.
4. **Frecuencia de Solicitud (MTBF)**: Promedio de días transcurridos entre fallas sucesivas para medir fiabilidad.
5. **Último Mantenimiento**: Fecha exacta del último mantenimiento concluido. Si `fechaUltimoServicio` se encuentra como `null` en base de datos, el backend lo calcula dinámicamente buscando la última tarea en estado `RESUELTO` o `CERRADO`.

---

## 3. Automatizaciones Diarias (CRON)

El servidor corre tareas automáticas recurrentes a las horas indicadas:
* **Cierre Automático de Tickets (01:00 AM)**: Cierra tareas en estado `RESUELTO` que lleven más de 2 días sin respuesta del cliente.
* **Limpieza de Bitácora (03:00 AM)**: Elimina logs históricos de auditoría con antigüedad superior a 180 días.
* **Auto-Pausa y Recorte de Turno (19:00 Lunes a Sábado)**:
  * Cambia las tareas activas de `EN_PROGRESO` a `EN_PAUSA` al concluir la jornada de trabajo.
  * **Time Trimming (Recorte de tiempo)**: Ajusta la hora de finalización del intervalo al final del turno oficial (`17:30`) para evitar "tiempo fantasma" (horas de inactividad registradas erróneamente en progreso), a menos que el inicio haya sido posterior a las `17:30` (horas extra), en cuyo caso se corta a las `19:00`.