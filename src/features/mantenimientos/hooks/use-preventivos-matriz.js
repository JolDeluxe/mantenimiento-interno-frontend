// src/features/mantenimientos/hooks/use-preventivos-matriz.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { getProyeccionesGlobales } from '../../maquinaria/api/recurrencias-api';
import { getMantenimientos } from '../api/mantenimientos-api';
import { readSnapshot, writeSnapshot } from '@/lib/idb';
import { getMesIndexFromYYYYMMDD } from '../helpers/fechas';

export const usePreventivosMatriz = (initialYear = new Date().getFullYear()) => {
    const [year, setYear] = useState(initialYear);
    const [eventosMap, setEventosMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const lastParams = useRef({ year });
    const hasHydratedFromCache = useRef(false);

    const buildEventosMatriz = useCallback((ticketsReales, proyeccionesGlobales) => {
        const tempMap = {};

        // 1. Agrupar Tickets Reales (PLANEADA/PREVENTIVO)
        ticketsReales.forEach((ticket) => {
            if (!ticket.maquinaId || !ticket.fechaCicloLogica) return;
            
            // Si el backend no envía fechaCicloLogicaFormateada directamente en el ticket,
            // la derivamos del campo fechaCicloLogica (YYYY-MM-DDT00:00:00.000Z)
            const fechaCicloStr = ticket.fechaCicloLogica.split('T')[0];
            const mesIdx = getMesIndexFromYYYYMMDD(fechaCicloStr);
            const maquinaId = ticket.maquinaId;

            const cellKey = `${maquinaId}-${mesIdx}`;
            if (!tempMap[cellKey]) tempMap[cellKey] = [];

            tempMap[cellKey].push({
                tipo: 'REAL',
                id: ticket.id,
                titulo: ticket.titulo,
                estado: ticket.estado,
                prioridad: ticket.prioridad,
                fechaCicloLogicaFormateada: fechaCicloStr,
                fechaVencimientoFormateada: ticket.fechaVencimiento ? ticket.fechaVencimiento.split('T')[0] : fechaCicloStr
            });
        });

        // 2. Agrupar Proyecciones Virtuales (pendientes de materializar)
        proyeccionesGlobales.forEach((proj) => {
            if (!proj.pendienteMaterializar) return; // Si ya fue materializado, ya lo procesamos arriba como REAL

            const mesIdx = getMesIndexFromYYYYMMDD(proj.fechaCicloLogicaFormateada);
            const maquinaId = proj.maquinaId;
            const cellKey = `${maquinaId}-${mesIdx}`;

            if (!tempMap[cellKey]) tempMap[cellKey] = [];

            // Doble validación en UI: evitar agregar proyección si ya hay un ticket real
            // para la misma máquina y fecha lógica exacta de ciclo
            const existeReal = tempMap[cellKey].some(
                (evt) => evt.tipo === 'REAL' && evt.fechaCicloLogicaFormateada === proj.fechaCicloLogicaFormateada
            );

            if (!existeReal) {
                tempMap[cellKey].push({
                    tipo: 'PROYECTADO',
                    reglaId: proj.reglaId,
                    titulo: proj.titulo,
                    prioridad: proj.prioridad,
                    tecnicoNombre: proj.tecnicoNombre,
                    fechaCicloLogicaFormateada: proj.fechaCicloLogicaFormateada,
                    fechaVencimientoSugeridaFormateada: proj.fechaVencimientoSugeridaFormateada
                });
            }
        });

        return tempMap;
    }, []);

    const fetchMatriz = useCallback(async (targetYear = year) => {
        setLoading(true);
        setError(null);
        lastParams.current = { year: targetYear };

        const cacheKey = `recurrencias_proyecciones_${targetYear}`;

        // 1. Cargar cacheIndexedDB de forma asíncrona
        if (!hasHydratedFromCache.current) {
            try {
                const snapshot = await readSnapshot('preventivos_matriz', cacheKey);
                if (snapshot?.data) {
                    setEventosMap(snapshot.data);
                    hasHydratedFromCache.current = true;
                }
            } catch (err) {
                console.warn('[usePreventivosMatriz] Cache read failed:', err);
            }
        }

        if (!navigator.onLine) {
            setLoading(false);
            return;
        }

        try {
            // Consultar simultáneamente:
            // - Proyecciones globales virtuales
            // - Tickets reales (planeados / preventivos) del año
            const [proyeccionesRes, ticketsRes] = await Promise.all([
                getProyeccionesGlobales({ year: targetYear }),
                getMantenimientos({
                    year: targetYear,
                    limit: 1000 // Asegurarnos de traer el volumen anual
                })
            ]);

            const proyeccionesData = proyeccionesRes?.data?.data || [];
            // Filtrar del listado de tickets solo los preventivos con fecha lógica asignada
            const ticketsListRaw = ticketsRes?.data?.data || ticketsRes?.data || [];
            const ticketsRealPreventivos = ticketsListRaw.filter(
                (t) => t.reglaRecurrenciaId != null && t.fechaCicloLogica != null
            );

            const map = buildEventosMatriz(ticketsRealPreventivos, proyeccionesData);
            setEventosMap(map);

            // Persistir instantánea
            await writeSnapshot('preventivos_matriz', map, cacheKey);
        } catch (err) {
            console.error('[usePreventivosMatriz] Fetch error:', err);
            setError('Error al cargar la matriz de mantenimientos preventivos.');
        } finally {
            setLoading(false);
        }
    }, [year, buildEventosMatriz]);

    // Recargar al cambiar de año
    useEffect(() => {
        hasHydratedFromCache.current = false;
        fetchMatriz(year);
    }, [year, fetchMatriz]);

    const cambiarAno = useCallback((nuevoAno) => {
        setYear(nuevoAno);
    }, []);

    return {
        year,
        eventosMap,
        loading,
        error,
        cambiarAno,
        refetchMatriz: () => fetchMatriz(year)
    };
};
