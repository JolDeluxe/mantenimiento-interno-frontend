// src/features/mantenimientos/pages/mantenimientos-page.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import MantenimientosLayoutDesktop from '../views/mantenimientos-layout-desktop';
import MantenimientosLayoutMobile from '../views/mantenimientos-layout-mobile';

export default function MantenimientosPage() {
    const isDesktop = useIsDesktop();

    return (
        <div className="max-w-full mx-auto">
            <div className="p-1 lg:p-4 flex flex-col h-full">
                {isDesktop ? <MantenimientosLayoutDesktop /> : <MantenimientosLayoutMobile />}

                <div className="flex-1 w-full mt-2">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
