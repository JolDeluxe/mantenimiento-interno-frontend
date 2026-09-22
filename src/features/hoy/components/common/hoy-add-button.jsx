// src/features/hoy/components/common/hoy-add-button.jsx
import React from 'react';
import { TicketAddButton as TicketsAdd } from '@/features/tickets/components/historico/ticket-add-button';
import { TicketAddButton as MantenimientosAdd } from '@/features/mantenimientos/components/common/mantenimientos-add-button';
import { Button, Fab } from '@/components/ui/z_index';

export const HoyAddButton = ({ scope = 'general', currentUser, ...props }) => {
    if (currentUser?.rol === 'TECNICO') {
        if (props.isMobile) {
            return (
                <Fab
                    icon="add_task"
                    onClick={props.onClick}
                    variant="glass-blue"
                    positionClass="bottom-24 right-5"
                />
            );
        }
        return (
            <div className="flex justify-end w-full px-2 lg:px-0">
                <Button variant="accion" icon="add_task" onClick={props.onClick} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Registrar mi trabajo
                </Button>
            </div>
        );
    }

    const ActiveAddButton = scope === 'mantenimientos' ? MantenimientosAdd : TicketsAdd;
    return <ActiveAddButton {...props} />;
};
