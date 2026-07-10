import { Icon } from '@/components/ui/z_index';

const TABS = [
    { id: 'tickets', label: 'Historial preventivos', icon: 'build_circle' },
    { id: 'plan', label: 'Plan recurrente', icon: 'event_repeat' },
    { id: 'matriz', label: 'Matriz', icon: 'calendar_month' },
];

export const RecurrentesTabs = ({ activeTab, onChange }) => (
    <div className="sticky top-[58px] z-30 flex flex-nowrap gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
        {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => onChange(tab.id)}
                    className={`flex min-w-fit items-center gap-2 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wide transition-colors ${
                        active
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
);
