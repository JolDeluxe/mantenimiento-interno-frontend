// src/features/hoy/pages/hoy-page.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import HoyLayoutDesktop from '../views/hoy-layout-desktop';
import HoyLayoutMobile from '../views/hoy-layout-mobile';

export default function HoyPage() {
    const isDesktop = useIsDesktop();

    return (
        <div className="max-w-full mx-auto">
            <div className="p-1 lg:p-4 flex flex-col h-full">
                {isDesktop ? <HoyLayoutDesktop /> : <HoyLayoutMobile />}

                <div className="flex-1 w-full mt-2">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}