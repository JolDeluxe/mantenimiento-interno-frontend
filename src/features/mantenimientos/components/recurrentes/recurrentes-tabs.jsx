import { Icon } from '@/components/ui/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { useIsDesktop } from '@/hooks/useMediaQuery';

const TABS = [
    { id: 'tickets', label: 'Historial preventivos', icon: 'build_circle' },
    { id: 'plan', label: 'Plan recurrente', icon: 'event_repeat' },
    { id: 'matriz', label: 'Matriz', icon: 'calendar_month' },
];

export const RecurrentesTabs = ({ activeTab, onChange }) => {
    const isDesktop = useIsDesktop();

    return (
        <div
            className="relative overflow-hidden rounded-2xl p-1 shadow-sm"
            style={isDesktop ? undefined : { ...glassBase('light'), borderRadius: 16 }}
        >
            {!isDesktop && <GlassSheen />}
            <div className={`relative z-10 flex flex-nowrap gap-2 overflow-x-auto rounded-xl p-0.5 ${isDesktop ? 'border border-slate-200 bg-white' : ''}`}>
            {TABS.map((tab) => {
                const active = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onChange(tab.id)}
                        style={!isDesktop && active ? { ...glassBase('primary'), borderRadius: 12 } : undefined}
                        className={`flex min-w-fit items-center gap-2 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wide transition-colors ${
                            active
                                ? isDesktop
                                    ? 'bg-marca-primario text-white shadow-sm'
                                    : 'text-white shadow-sm'
                                : isDesktop
                                    ? 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                    : 'text-slate-600 hover:bg-white/30'
                        }`}
                    >
                        <Icon name={tab.icon} size="16px" />
                        {tab.label}
                    </button>
                );
            })}
            </div>
        </div>
    );
};
