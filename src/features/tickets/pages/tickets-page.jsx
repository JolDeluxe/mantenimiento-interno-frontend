import React from 'react';
import { Outlet } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import TicketsLayoutDesktop from '../views/tickets-layout-desktop';
import TicketsLayoutMobile from '../views/tickets-layout-mobile';

export default function TicketsPage() {
    const isDesktop = useMediaQuery('(min-width: 1024px)');

    // Copiamos exactamente la estructura de envoltura de UsersPage
    return (
        <div className="max-w-full mx-auto">
            <div className="p-1 lg:p-4">
                {isDesktop ? (
                    <TicketsLayoutDesktop>
                        <Outlet />
                    </TicketsLayoutDesktop>
                ) : (
                    <TicketsLayoutMobile>
                        <Outlet />
                    </TicketsLayoutMobile>
                )}
            </div>
        </div>
    );
}