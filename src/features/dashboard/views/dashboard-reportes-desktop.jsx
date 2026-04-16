// src/features/dashboard/views/dashboard-reportes-desktop.jsx
import React from 'react';
import { ReportesConstruccion } from '../components/reportes/reportes-construccion';

export default function DashboardReportesDesktop() {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm min-h-[60vh] flex items-center justify-center p-8 animate-in fade-in duration-500">
            <ReportesConstruccion />
        </div>
    );
}