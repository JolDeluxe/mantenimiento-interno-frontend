import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMetricas } from '../hooks/use-area';
import { getMinDateHoy } from '@/lib/date';

const getCurrentYear = () => Number(getMinDateHoy().split('-')[0]);
const getCurrentMonth = () => Number(getMinDateHoy().split('-')[1]);

const DEFAULT_FILTRO = {
    year: getCurrentYear(),
    month: getCurrentMonth(),
    fechaInicio: null,
    fechaFin: null,
    departamentoId: null,
};

export const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
    // FIX: Se extraen los nombres exactos que exporta tu hook useMetricas
    const { data, loading, error, fetchMetricas } = useMetricas();
    const [filtro, setFiltro] = useState(DEFAULT_FILTRO);

    // Re-fetch cada vez que cambia el filtro
    useEffect(() => {
        fetchMetricas(filtro);
    }, [filtro, fetchMetricas]);

    const onFiltroChange = useCallback((changes) => {
        setFiltro((prev) => ({ ...prev, ...changes }));
    }, []);

    const refresh = useCallback(() => fetchMetricas(filtro), [filtro, fetchMetricas]);

    return (
        <DashboardContext.Provider value={{ data, loading, error, filtro, onFiltroChange, refresh }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboardContext = () => {
    const ctx = useContext(DashboardContext);
    if (!ctx) throw new Error('useDashboardContext debe usarse dentro de DashboardProvider');
    return ctx;
};