// src/features/dashboard/views/dashboard-reportes-mobile.jsx
import React from 'react';
import { ReportesConstruccion } from '../components/reportes/reportes-construccion';

export default function DashboardReportesMobile() {
    return (
        <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl shadow-sm min-h-[50vh] flex items-center justify-center mt-2 mx-1 p-4 animate-in fade-in zoom-in-95 duration-500">
            <ReportesConstruccion />
        </div>
    );
}