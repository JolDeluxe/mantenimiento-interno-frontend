import { cn } from '@/utils/cn';

/**
 * Badge numérico para el conteo de no leídas.
 * Se renderiza encima del ícono de la campana.
 */
export const NotifyBadge = ({ count, className }) => {
    if (!count || count <= 0) return null;

    return (
        <span
            className={cn(
                'absolute -top-1 -right-1 flex items-center justify-center',
                'min-w-[18px] h-[18px] px-1 rounded-full',
                'bg-estado-rechazado text-white text-[10px] font-extrabold leading-none',
                'border-2 border-white shadow-sm',
                className
            )}
        >
            {count > 99 ? '99+' : count}
        </span>
    );
};