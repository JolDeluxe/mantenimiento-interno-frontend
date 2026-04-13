import { createContext, useContext } from 'react';

// Creamos el contexto
export const DashboardContext = createContext(null);

// Hook personalizado para consumirlo
export const useDashboardContext = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error("useDashboardContext debe usarse dentro de DashboardProvider");
    }
    return context;
};