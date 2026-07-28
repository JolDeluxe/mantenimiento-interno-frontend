import { useState, useEffect, useCallback, useRef } from 'react';
import { getAutonomosConfig, patchAutonomosConfig } from '../api/configuracion-api';
import { toast } from 'react-toastify';

/**
 * Estados posibles de la carga inicial:
 *   'loading'  – petición en vuelo
 *   'loaded'   – respuesta válida del servidor
 *   'error'    – el servidor no estuvo disponible o devolvió un error real
 */
export const useConfiguracion = () => {
  const [habilitado, setHabilitado] = useState(false);
  const [status, setStatus] = useState('loading'); // 'loading' | 'loaded' | 'error'
  const [submitting, setSubmitting] = useState(false);

  // Referencia al AbortController activo para la petición de carga
  const abortRef = useRef(null);

  const fetchConfig = useCallback(async (isManual = false) => {
    // Cancela cualquier petición de carga en vuelo antes de lanzar una nueva
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('loading');
    try {
      const data = await getAutonomosConfig(controller.signal);
      // Solo actualizamos el estado si el componente sigue montado
      setHabilitado(data.habilitado);
      setStatus('loaded');
      if (isManual) {
        toast.success('Configuración sincronizada correctamente.');
      }
    } catch (err) {
      // Los errores de cancelación (desmontaje o nueva petición) no son errores reales
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED' || controller.signal.aborted) {
        return;
      }
      setStatus('error');
      if (isManual) {
        // En recarga manual sí mostramos el toast porque el usuario lo pidió explícitamente
        toast.error('No se pudo sincronizar la configuración en este momento.');
      }
    } finally {
      // Limpiamos la referencia solo si sigue siendo el mismo controller
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, []);

  const updateConfig = useCallback(async (nuevoValor) => {
    setSubmitting(true);
    const valorPrevio = habilitado;
    setHabilitado(nuevoValor); // Actualización optimista

    try {
      const data = await patchAutonomosConfig(nuevoValor);
      setHabilitado(data.habilitado);
      toast.success(
        nuevoValor
          ? 'Mantenimientos autónomos habilitados con éxito'
          : 'Mantenimientos autónomos deshabilitados con éxito'
      );
    } catch {
      setHabilitado(valorPrevio); // Revertimos en caso de error
      toast.error('Error al actualizar la configuración de autónomos');
    } finally {
      setSubmitting(false);
    }
  }, [habilitado]);

  useEffect(() => {
    fetchConfig(false);

    return () => {
      // Al desmontar, cancelamos la petición en vuelo si existe
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [fetchConfig]);

  return {
    habilitado,
    loading: status === 'loading',
    hasError: status === 'error',
    isLoaded: status === 'loaded',
    submitting,
    updateConfig,
    refreshConfig: () => fetchConfig(true),
  };
};
