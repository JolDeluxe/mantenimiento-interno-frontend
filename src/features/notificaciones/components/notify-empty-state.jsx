import { Icon } from '@/components/ui/z_index';

export const NotifyEmptyState = ({ soloNoLeidas = false }) => (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
            <Icon
                name={soloNoLeidas ? 'notifications_off' : 'notifications'}
                size="xl"
                className="text-slate-300"
            />
        </div>
        <div>
            <p className="text-lg font-bold text-slate-400">
                {soloNoLeidas ? 'Sin notificaciones nuevas' : 'Sin notificaciones'}
            </p>
            <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                {soloNoLeidas
                    ? 'Estás al día con todas tus actualizaciones.'
                    : 'Las actualizaciones de tus tareas de mantenimiento aparecerán aquí.'}
            </p>
        </div>
    </div>
);