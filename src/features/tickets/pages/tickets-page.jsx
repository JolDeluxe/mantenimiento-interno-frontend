import React from 'react';
import { Outlet } from 'react-router-dom';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import TicketsLayoutDesktop from '../views/tickets-layout-desktop';
import TicketsLayoutMobile from '../views/tickets-layout-mobile';

export default function TicketsPage() {
    const isDesktop = useIsDesktop();

    return (
        <div className="max-w-full mx-auto">
            <div className="p-1 lg:p-4 flex flex-col h-full">
                {/* 1. Las barras de navegación reaccionan al tamaño, pero no envuelven al Outlet */}
                {isDesktop ? <TicketsLayoutDesktop /> : <TicketsLayoutMobile />}

                {/* 2. El Outlet es inmutable. NUNCA se destruirá por cambios de responsividad */}
                <div className="flex-1 w-full mt-2">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}