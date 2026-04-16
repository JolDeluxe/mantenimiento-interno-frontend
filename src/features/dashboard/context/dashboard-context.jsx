import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMetricas } from '../hooks/use-metricas';
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
    const { data, loading, errors, fetchAll } = useMetricas();
    const [filtro, setFiltro] = useState(DEFAULT_FILTRO);

    // Re-fetch cada vez que cambia el filtro
    useEffect(() => { fetchAll(filtro); }, [filtro, fetchAll]);

    const onFiltroChange = useCallback((changes) => {
        setFiltro((prev) => ({ ...prev, ...changes }));
    }, []);

    const refresh = useCallback(() => fetchAll(filtro), [filtro, fetchAll]);

    return (
        <DashboardContext.Provider value={{ data, loading, errors, filtro, onFiltroChange, refresh }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboardContext = () => {
    const ctx = useContext(DashboardContext);
    if (!ctx) throw new Error('useDashboardContext debe usarse dentro de DashboardProvider');
    return ctx;
};