// src/features/tickets/components/historico/ticket-assign-modal.jsx
import { useState, useEffect, useMemo } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';

const ROL_LABEL = {
    TECNICO: 'Técnico',
    COORDINADOR_MTTO: 'Coordinador',
};

const ROL_COLOR = {
    TECNICO: 'bg-blue-100 text-blue-700',
    COORDINADOR_MTTO: 'bg-amber-100 text-amber-700',
};

const TecnicoCard = ({ usuario, isSelected, onToggle }) => (
    <button
        type="button"
        onClick={onToggle}
        className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left
            transition-all duration-150 cursor-pointer active:scale-[0.98]
            ${isSelected
                ? 'bg-marca-primario/5 border-marca-primario text-marca-primario shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }
        `}
    >
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0
            ${isSelected ? 'bg-marca-primario text-white' : 'bg-slate-100 text-slate-500'}`}>
            {usuario.nombre?.charAt(0).toUpperCase() ?? '?'}
        </div>

        <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-bold leading-tight truncate">{usuario.nombre}</span>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {usuario.cargo && (
                    <span className={`text-xs truncate ${isSelected ? 'text-marca-primario/70' : 'text-slate-400'}`}>
                        {usuario.cargo}
                    </span>
                )}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${ROL_COLOR[usuario.rol] ?? 'bg-slate-100 text-slate-600'}`}>
                    {ROL_LABEL[usuario.rol] ?? usuario.rol}
                </span>
            </div>
        </div>

        <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
            ${isSelected ? 'bg-marca-primario border-marca-primario' : 'border-slate-300 bg-white'}`}>
            {isSelected && <Icon name="check" size="xs" className="text-white" />}
        </div>
    </button>
);

export const TicketAssignModal = ({
    isOpen,
    onClose,
    ticket,
    tecnicos = [],
    onConfirm,
    isSubmitting,
}) => {
    // ──────────────────────────────────────────────────────────────────────
    // TODOS los hooks ANTES de cualquier return condicional — Rules of Hooks
    // ──────────────────────────────────────────────────────────────────────
    const [seleccionados, setSeleccionados] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [error, setError] = useState(null);

    const usuariosFiltrados = useMemo(() => {
        // 1. Filtrar por búsqueda
        const filtrados = tecnicos.filter((t) =>
            t.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (t.cargo ?? '').toLowerCase().includes(busqueda.toLowerCase())
        );

        // 2. Ordenar: Seleccionados primero, luego alfabéticamente
        return filtrados.sort((a, b) => {
            const isASelected = seleccionados.includes(String(a.id));
            const isBSelected = seleccionados.includes(String(b.id));

            if (isASelected && !isBSelected) return -1;
            if (!isASelected && isBSelected) return 1;

            // Si ambos están seleccionados o ambos no, ordenar por nombre
            return a.nombre.localeCompare(b.nombre);
        });
    }, [tecnicos, busqueda, seleccionados]);

    const totalSeleccionados = seleccionados.length;

    useEffect(() => {
        if (isOpen && ticket) {
            setSeleccionados(ticket.responsables?.map((r) => String(r.id)) ?? []);
            setBusqueda('');
            setError(null);
        }
    }, [isOpen, ticket]);

    // Early return SIEMPRE después de los hooks
    if (!ticket) return null;

    const handleToggle = (id) => {
        const idStr = String(id);
        setSeleccionados((prev) =>
            prev.includes(idStr) ? prev.filter((x) => x !== idStr) : [...prev, idStr]
        );
        setError(null);
    };

    const handleSubmit = () => {
        const formData = new FormData();
        seleccionados.forEach((id) => formData.append('responsables', id));
        onConfirm(ticket.id, formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()}>
            <ModalHeader
                title={`Asignar responsable — #${ticket.id}`}
                onClose={() => !isSubmitting && onClose()}
            />
            <ModalBody>
                <div className="flex flex-col gap-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Tarea</p>
                        <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">{ticket.titulo}</p>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">Técnicos y coordinadores:</p>
                        {totalSeleccionados > 0 && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-marca-primario bg-marca-primario/10 px-2.5 py-1 rounded-full">
                                <Icon name="check_circle" size="xs" />
                                {totalSeleccionados} seleccionado{totalSeleccionados > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    {tecnicos.length > 5 && (
                        <div className="relative">
                            <Icon name="search" size="xs" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder="Buscar por nombre o cargo…"
                                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-secundario/20 bg-white"
                            />
                        </div>
                    )}

                    {tecnicos.length === 0 ? (
                        <div className="flex flex-col items-center py-8 text-slate-400 gap-3">
                            <Icon name="engineering" size="xl" />
                            <p className="text-sm italic">No hay personal disponible.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-0.5 custom-scrollbar">
                            {usuariosFiltrados.length > 0 ? (
                                usuariosFiltrados.map((u) => (
                                    <TecnicoCard
                                        key={u.id}
                                        usuario={u}
                                        isSelected={seleccionados.includes(String(u.id))}
                                        onToggle={() => handleToggle(u.id)}
                                    />
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic text-center py-4">
                                    Sin resultados para "{busqueda}"
                                </p>
                            )}
                        </div>
                    )}

                    {totalSeleccionados > 0 && (
                        <button type="button" onClick={() => setSeleccionados([])}
                            className="text-xs text-slate-400 hover:text-red-500 transition-colors font-bold self-start">
                            Limpiar selección
                        </button>
                    )}

                    {error && <p className="text-xs text-estado-rechazado font-bold">{error}</p>}
                </div>
            </ModalBody>
            <ModalFooter>
                <Button variant="cancelar" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                <Button variant="guardar" icon="engineering" isLoading={isSubmitting} onClick={handleSubmit}>
                    Confirmar asignación
                </Button>
            </ModalFooter>
        </Modal>
    );
};