import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';

export const RoleGuard = ({ allowedRoles = [] }) => {
    const user = useAuthStore((state) => state.user);

    if (!user?.rol || !allowedRoles.includes(user.rol)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};