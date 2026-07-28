import React from 'react';
import { Icon } from '@/components/ui/z_index';
import { useConfiguracion } from '../hooks/use-configuracion';

const ConfiguracionAutonomosPage = () => {
  const {
    habilitado,
    loading,
    hasError,
    isLoaded,
    submitting,
    updateConfig,
    refreshConfig,
  } = useConfiguracion();

  // El switch sólo se habilita cuando hay una respuesta válida del backend
  const switchDisabled = !isLoaded || submitting;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Icon name="settings" size="md" className="text-slate-600" />
          Configuración del Sistema
        </h1>
        <p className="text-sm text-slate-500">
          Administración de parámetros globales del sistema de mantenimiento.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Banner de fase de pruebas */}
        <div className="bg-amber-50 border-b border-amber-200 p-4 flex gap-3 items-start">
          <Icon name="warning" size="md" className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-amber-900 text-sm">Fase de pruebas piloto</h4>
            <p className="text-xs text-amber-700 leading-relaxed">
              El módulo de Mantenimiento Autónomo se encuentra en etapa de validación.
              Active esta opción para habilitar el gateway público del QR y realizar pruebas con operarios anónimos.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Estado: cargando */}
          {loading && (
            <div className="flex items-center justify-center py-8 gap-3 text-slate-500">
              <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin shrink-0" />
              <span className="text-sm">Cargando configuración…</span>
            </div>
          )}

          {/* Estado: error al cargar */}
          {hasError && (
            <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
              <Icon name="cloud_off" size="lg" className="text-slate-400" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-700">
                  No se pudo cargar la configuración en este momento.
                </p>
                <p className="text-xs text-slate-500">
                  Intenta nuevamente en unos momentos.
                </p>
              </div>
              <button
                type="button"
                onClick={refreshConfig}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold
                           bg-slate-900 text-white hover:bg-slate-700 active:bg-slate-800
                           focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
                           transition-colors"
              >
                <Icon name="refresh" size="sm" />
                Intentar nuevamente
              </button>
            </div>
          )}

          {/* Estado: cargado correctamente */}
          {isLoaded && (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-1 max-w-xl">
                  <h3 className="font-bold text-slate-800 text-base">Habilitar Mantenimiento Autónomo</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Cuando está activado, los usuarios anónimos que escaneen el código QR de una máquina
                    podrán optar por abrir el formulario de Mantenimiento Autónomo público en lugar de
                    ser redirigidos de inmediato al inicio de sesión.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={habilitado}
                    aria-label={habilitado ? 'Desactivar mantenimiento autónomo' : 'Activar mantenimiento autónomo'}
                    disabled={switchDisabled}
                    onClick={() => updateConfig(!habilitado)}
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent
                                transition-colors duration-200 ease-in-out
                                focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
                                ${habilitado ? 'bg-emerald-600' : 'bg-slate-300'}
                                ${switchDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow
                                  ring-0 transition duration-200 ease-in-out
                                  ${habilitado ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>

                  <span
                    className={`text-xs font-semibold select-none px-2 py-0.5 rounded
                                ${habilitado
                                  ? 'text-emerald-700 bg-emerald-50'
                                  : 'text-slate-500 bg-slate-50'}`}
                  >
                    {submitting ? 'Guardando…' : habilitado ? 'Activado' : 'Desactivado'}
                  </span>
                </div>
              </div>

              {/* Pie de tarjeta */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Icon name="info" size="xs" className="shrink-0" />
                  Apagar el switch restaura inmediatamente el comportamiento predeterminado de redirección al login.
                </p>

                <button
                  type="button"
                  onClick={refreshConfig}
                  disabled={loading || submitting}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600
                             hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400
                             focus:ring-offset-1 rounded px-1.5 py-1
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors whitespace-nowrap"
                >
                  <Icon name="refresh" size="xs" />
                  Sincronizar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionAutonomosPage;
