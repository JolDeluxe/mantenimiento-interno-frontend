import React, { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { FontTester } from '@/components/test/font-tester'; 
import { IconTester } from '@/components/test/icon-tester';
import { UiTester } from '@/components/test/ui-tester'; 
import { TableTester } from '@/components/test/table-test';
import { Icon, Button, Card, CardBody } from '@/components/ui/z_index';
import api from '@/lib/axios';

const HomeDashboard = () => {
  const logout = useAuthStore((state) => state.logout);
  const [backendData, setBackendData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const probarConexionProtegida = async () => {
    try {
      setErrorMsg(null); setBackendData(null);
      const response = await api.get('/api/auth/me');
      setBackendData(response); 
    } catch (error) {
      setErrorMsg(error.message || "Error al conectar con el backend");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cuadra-arena/10 p-4">
      <div className="flex justify-center mb-8">
        <img src="/img/01_Cuadra_Mantnimento.webp" alt="Logo Cuadra" className="w-72 h-auto object-contain" />
      </div>
      
      <h1 className="fuente-titulos text-4xl text-marca-primario mb-4 text-center">
        Dashboard Principal
      </h1>
      
      <p className="text-slate-600 mb-8 text-center">
        Has iniciado sesión correctamente.<br/>
        <span className="text-sm">Presiona el botón para imprimir la respuesta en pantalla.</span>
      </p>
      
      <div className="flex gap-4 mb-8">
        <Button variant="accion" icon="api" onClick={probarConexionProtegida}>
          Llamar a /api/auth/me
        </Button>
        <Button variant="borrar" icon="logout" onClick={logout}>
          Cerrar Sesión
        </Button>
      </div>
      
      <TableTester />
      <FontTester />
      <IconTester />
      <UiTester />

      {backendData && (
        <Card className="w-full max-w-2xl mt-8">
          <CardBody>
            <h2 className="text-lg font-bold text-marca-primario mb-2 flex items-center gap-2">
              <Icon name="check_circle" className="text-estado-resuelto" /> Respuesta
            </h2>
            <pre className="font-codigo bg-slate-50 p-4 rounded-sm text-sm text-slate-700 overflow-x-auto whitespace-pre-wrap border border-slate-200">
              {JSON.stringify(backendData, null, 2)}
            </pre>
          </CardBody>
        </Card>
      )}

      {errorMsg && (
        <Card className="w-full max-w-2xl border-red-200 mt-8">
          <CardBody className="bg-red-50">
            <h2 className="text-lg font-bold text-red-800 mb-2 flex items-center gap-2">
              <Icon name="error" className="text-estado-rechazado" /> Error:
            </h2>
            <p className="text-sm text-red-600">{errorMsg}</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default HomeDashboard;