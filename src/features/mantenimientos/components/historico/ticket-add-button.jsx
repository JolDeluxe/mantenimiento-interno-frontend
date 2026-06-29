// src/features/tickets/components/historico/ticket-add-button.jsx
import { Button, Fab } from '@/components/ui/z_index';

export const TicketAddButton = ({ onClick, isMobile = false }) => {
    if (isMobile) {
        return (
            <Fab
                icon="add"
                onClick={onClick}
                variant="glass-blue"
                positionClass="bottom-24 right-5"
            />
        );
    }

    return (
        <div className="flex justify-end w-full px-2 lg:px-0">
            <Button variant="accion" icon="add" onClick={onClick}>
                Nueva tarea
            </Button>
        </div>
    );
};