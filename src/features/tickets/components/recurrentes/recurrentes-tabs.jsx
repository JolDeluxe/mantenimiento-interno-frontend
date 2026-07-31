import { Icon } from '@/components/ui/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { useIsDesktop } from '@/hooks/useMediaQuery';

const TABS = [
    { id: 'actividades', label: 'Actividades', mobileLabel: 'Actividades', icon: 'assignment' },
    { id: 'recurrentes', label: 'Recurrentes', mobileLabel: 'Recurrentes', icon: 'event_repeat' },
];

export const RecurrentesTabs = ({ activeTab, onChange }) => {
    const isDesktop = useIsDesktop();

    if (!isDesktop) {
        return (
            <div className="flex w-full justify-center">
                <div
                    className="relative flex w-full max-w-[272px] items-center justify-between gap-1 overflow-hidden rounded-2xl p-1 shadow-sm"
                    style={glassBase('light')}
                >
                    <GlassSheen />
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => onChange(tab.id)}
                                style={isActive ? { ...glassBase('primary'), borderRadius: 12 } : undefined}
                                className={`relative z-10 flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-black transition-all active:scale-95 ${
                                    isActive ? 'flex-[1.55] text-white shadow-sm' : 'flex-1 text-slate-600'
                                }`}
                            >
                                {isActive && <GlassSheen />}
                                <Icon name={tab.icon} size="16px" className="relative z-10 shrink-0" />
                                {isActive && (
                                    <span className="relative z-10 truncate">
                                        {tab.mobileLabel || tab.label}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-2xl p-1 shadow-sm">
            <div className="relative z-10 flex flex-nowrap gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-0.5">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onChange(tab.id)}
                            className={`flex min-w-fit items-center gap-2 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wide transition-colors ${
                                isActive
                                    ? 'bg-marca-primario text-white shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
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
