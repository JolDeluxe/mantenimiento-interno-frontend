import React, { useState, useEffect, useMemo } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { Input, Label, Select } from '@/components/form/z_index';
import { getAsignables } from '../../api/tickets-api';
import { PRIORIDADES } from '../../constants';

const ROL_LABEL = { TECNICO: 'Técnico', COORDINADOR_MTTO: 'Coordinador' };
const ROL_COLOR = { TECNICO: 'bg-blue-100 text-blue-700', COORDINADOR_MTTO: 'bg-amber-100 text-amber-700' };

// ── Badge de carga de trabajo ─────────────────────────────────────────────
const WorkloadBadge = ({ label, count, colorClass }) => (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${colorClass}`}>
        <span className="font-extrabold tabular-nums">{count}</span>
        <span className="font-medium opacity-80">{label}</span>
    </span>
);

// ── Tarjeta de técnico con avatar y workload ──────────────────────────────
const TecnicoCard = ({ usuario, isSelected, onToggle }) => {
    const { workload } = usuario;
    const sinTareas = !workload || (workload.asignadas === 0 && workload.enProgreso === 0 && workload.enPausa === 0);

    return (
        <div
            onClick={onToggle}
            className={`
                group relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer overflow-hidden
                ${isSelected ? 'border-estado-asignada bg-estado-asignada/5' : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'}
            `}
        >
            <div className="relative">
                {usuario.imagen ? (
                    <img src={usuario.imagen} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300">
                        <Icon name="person" size="md" className="text-slate-400" />
                    </div>
                )}
                {isSelected && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-estado-asignada text-white rounded-full flex items-center justify-center shadow-sm">
                        <Icon name="check" size="xs" />
                    </div>
                )}
            </div>

            <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-800 truncate pr-2">{usuario.nombre}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${ROL_COLOR[usuario.rol] || 'bg-slate-100 text-slate-600'}`}>
                        {ROL_LABEL[usuario.rol] || usuario.rol}
                    </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-1">
                    {sinTareas ? (
                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                            <Icon name="check_circle" size="xs" /> Libre
                        </span>
                    ) : (
                        <>
                            {workload?.enProgreso > 0 && <WorkloadBadge label="En curso" count={workload.enProgreso} colorClass="bg-blue-50 text-blue-700" />}
                            {workload?.enPausa > 0 && <WorkloadBadge label="Pausadas" count={workload.enPausa} colorClass="bg-amber-50 text-amber-700" />}
                            {workload?.asignadas > 0 && <WorkloadBadge label="Asignadas" count={workload.asignadas} colorClass="bg-slate-100 text-slate-700" />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export function BandejaAssignModal({ isOpen, onClose, ticket, onConfirm, isSubmitting }) {
    const [usuarios, setUsuarios] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [seleccionados, setSeleccionados] = useState([]);
    const [fechaProgramada, setFechaProgramada] = useState('');
    const [prioridad, setPrioridad] = useState('');

    useEffect(() => {
        if (isOpen) {
            setIsLoadingUsers(true);
            getAsignables()
                .then(res => {
                    const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
                    setUsuarios(list);
                })
                .catch(() => setUsuarios([]))
                .finally(() => setIsLoadingUsers(false));
        }
    }, [isOpen]);

    useEffect(() => {
        if (ticket && isOpen) {
            setSeleccionados([]);
            setBusqueda('');
            setFechaProgramada(new Date().toISOString().split('T')[0]);
            setPrioridad(ticket.prioridad || 'MEDIA');
        }
    }, [ticket, isOpen]);

    const usuariosFiltrados = useMemo(() => {
        return usuarios.filter(u =>
            u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            u.rol.toLowerCase().includes(busqueda.toLowerCase())
        );
    }, [usuarios, busqueda]);

    const handleToggle = (id) => {
        const idStr = String(id);
        setSeleccionados(prev =>
            prev.includes(idStr) ? prev.filter(userId => userId !== idStr) : [...prev, idStr]
        );
    };

    const setToday = () => setFechaProgramada(new Date().toISOString().split('T')[0]);
    const setTomorrow = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setFechaProgramada(tomorrow.toISOString().split('T')[0]);
    };

    const handleSubmit = () => {
        if (seleccionados.length === 0 || !fechaProgramada) return;
        onConfirm({
            ticketId: ticket.id,
            responsables: seleccionados.map(Number),
            fechaProgramada: new Date(fechaProgramada).toISOString(),
            prioridad: prioridad,
            estado: 'ASIGNADO'
        });
    };

    if (!ticket) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalHeader title="Configurar y Asignar" onClose={onClose} />

            <ModalBody>
                {/* 🚨 CORRECCIÓN: Este div con padding interno (p-4 sm:p-6) es el secreto del UI Kit */}
                <div className="flex flex-col gap-6 p-4 sm:p-6">

                    {/* Resumen Limpio del Ticket */}
                    <div className="flex flex-col">
                        <span className="text-xs font-mono font-bold text-marca-primario mb-1">
                            {ticket.folio || `#${String(ticket.id).padStart(5, '0')}`}
                        </span>
                        <h3 className="text-lg font-black text-slate-800 leading-tight">
                            {ticket.titulo}
                        </h3>
                    </div>

                    {/* Grid Formulario: Fechas y Prioridad */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-2">
                            <Label required>Fecha Programada</Label>
                            <Input
                                type="date"
                                value={fechaProgramada}
                                onChange={(e) => setFechaProgramada(e.target.value)}
                                disabled={isSubmitting}
                            />
                            {/* Botones de acción rápida nativos de tu kit */}
                            <div className="flex gap-3 mt-1 px-1">
                                <button type="button" onClick={setToday} disabled={isSubmitting} className="text-xs font-bold text-slate-500 hover:text-marca-primario transition-colors">
                                    Hoy
                                </button>
                                <span className="text-slate-300">•</span>
                                <button type="button" onClick={setTomorrow} disabled={isSubmitting} className="text-xs font-bold text-slate-500 hover:text-marca-primario transition-colors">
                                    Mañana
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label required>Prioridad</Label>
                            <Select
                                options={PRIORIDADES}
                                value={prioridad}
                                onChange={(val) => setPrioridad(val)}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Selector de Personal (Diseño Histórico Exacto) */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-marca-primario/10 flex items-center justify-center shrink-0">
                                <Icon name="engineering" className="text-marca-primario" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Personal Técnico</h3>
                                <p className="text-xs text-slate-500">
                                    {seleccionados.length > 0
                                        ? <span className="text-estado-asignada font-bold">{seleccionados.length} seleccionados</span>
                                        : "Puedes asignar uno o múltiples técnicos."}
                                </p>
                            </div>
                        </div>

                        <Input
                            icon="search"
                            placeholder="Buscar por nombre o rol..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />

                        <div className="flex flex-col gap-2 max-h-[35vh] overflow-y-auto custom-scrollbar pr-1">
                            {isLoadingUsers ? (
                                <p className="text-sm text-slate-400 text-center py-6 italic">Cargando personal disponible...</p>
                            ) : usuariosFiltrados.length > 0 ? (
                                usuariosFiltrados.map(u => (
                                    <TecnicoCard
                                        key={u.id}
                                        usuario={u}
                                        isSelected={seleccionados.includes(String(u.id))}
                                        onToggle={() => handleToggle(u.id)}
                                    />
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 text-center py-6 italic">Sin resultados para "{busqueda}"</p>
                            )}
                        </div>

                        {seleccionados.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setSeleccionados([])}
                                className="text-xs text-slate-400 hover:text-red-500 transition-colors font-bold self-start"
                            >
                                Limpiar selección
                            </button>
                        )}
                    </div>

                </div>
            </ModalBody>

            <ModalFooter>
                <Button variant="cancelar" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                <Button
                    variant="guardar"
                    icon="engineering"
                    isLoading={isSubmitting}
                    disabled={seleccionados.length === 0 || !fechaProgramada}
                    onClick={handleSubmit}
                >
                    Confirmar asignación
                </Button>
            </ModalFooter>
        </Modal>
    );
}