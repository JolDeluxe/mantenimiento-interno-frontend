import React from 'react';
import { useConfiguracion } from '../hooks/use-configuracion';

const ConfiguracionAutonomosPage = () => {
  const {
    habilitado,
    loading,
    submitting,
    updateConfig,
    refreshConfig
  } = useConfiguracion();

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-600">settings</span>
          Configuración del Sistema
        </h1>
        <p className="text-sm text-slate-500">
          Administración de parámetros globales del sistema de mantenimiento.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Banner de fase de pruebas */}
        <div className="bg-amber-50 border-b border-amber-200 p-4 flex gap-3">
          <span className="material-symbols-outlined text-amber-600 shrink-0">warning</span>
          <div className="space-y-1">
            <h4 className="font-semibold text-amber-900 text-sm">Fase de pruebas piloto</h4>
            <p className="text-xs text-amber-700 leading-relaxed">
              El módulo de Mantenimiento Autónomo se encuentra en etapa de validación. 
              Active esta opción para habilitar el gateway público del QR y realizar pruebas con operarios anónimos.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-1 max-w-xl">
              <h3 className="font-bold text-slate-800 text-base">Habilitar Mantenimiento Autónomo</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cuando está activado, los usuarios anónimos que escaneen el código QR de una máquina podrán optar por 
                abrir el formulario de Mantenimiento Autónomo público en lugar de ser redirigidos de inmediato al inicio de sesión.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {loading ? (
                <div className="w-8 h-8 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => updateConfig(!habilitado)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${
                    habilitado ? 'bg-emerald-600' : 'bg-slate-300'
                  } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      habilitado ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              )}

              <span className={`text-xs font-semibold select-none ${
                habilitado ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded' : 'text-slate-500 bg-slate-50 px-2 py-0.5 rounded'
              }`}>
                {loading ? 'Cargando...' : habilitado ? 'Activado' : 'Desactivado'}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">info</span>
              Apagar el switch restaura inmediatamente el comportamiento predeterminado de redirección al login.
            </div>
            <button
              onClick={refreshConfig}
              disabled={loading || submitting}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 hover:underline disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Sincronizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionAutonomosPage;
