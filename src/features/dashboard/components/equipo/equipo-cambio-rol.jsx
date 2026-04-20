import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/z_index';

export const EquipoCambioRol = ({ rolActivo, setRolActivo }) => {
    return (
        <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200 self-start shadow-inner">
            <button
                type="button"
                onClick={() => setRolActivo('TECNICO')}
                className={cn(
                    'flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex-1 md:flex-none',
                    rolActivo === 'TECNICO'
                        ? 'bg-white text-marca-primario shadow-sm border border-slate-200/50'
                        : 'text-slate-500 hover:text-slate-700'
                )}
            >
                <Icon name="engineering" size="sm" />
                Técnicos
            </button>
            <button
                type="button"
                onClick={() => setRolActivo('COORDINADOR_MTTO')}
                className={cn(
                    'flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex-1 md:flex-none',
                    rolActivo === 'COORDINADOR_MTTO'
                        ? 'bg-white text-amber-600 shadow-sm border border-slate-200/50'
                        : 'text-slate-500 hover:text-slate-700'
                )}
            >
                <Icon name="manage_accounts" size="sm" />
                Coordinadores
            </button>
        </div>
    );
};