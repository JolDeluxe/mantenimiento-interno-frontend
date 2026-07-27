import { useState, useEffect, useCallback } from 'react';
import { getAutonomosConfig, patchAutonomosConfig } from '../api/configuracion-api';
import { toast } from 'react-toastify';

export const useConfiguracion = () => {
  const [habilitado, setHabilitado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAutonomosConfig();
      setHabilitado(data.habilitado);
    } catch {
      toast.error('Error al obtener la configuración de autónomos');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (nuevoValor) => {
    setSubmitting(true);
    // Cambiamos el estado localmente de forma optimista
    const valorPrevio = habilitado;
    setHabilitado(nuevoValor);

    try {
      const data = await patchAutonomosConfig(nuevoValor);
      setHabilitado(data.habilitado);
      toast.success(
        nuevoValor 
          ? 'Mantenimientos autónomos habilitados con éxito' 
          : 'Mantenimientos autónomos deshabilitados con éxito'
      );
    } catch {
      // Revertimos en caso de error
      setHabilitado(valorPrevio);
      toast.error('Error al actualizar la configuración de autónomos');
    } finally {
      setSubmitting(false);
    }
  }, [habilitado]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return {
    habilitado,
    loading,
    submitting,
    updateConfig,
    refreshConfig: fetchConfig,
  };
};
