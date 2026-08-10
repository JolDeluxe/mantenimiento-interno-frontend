import { Navigate } from 'react-router-dom';

export default function DashboardMaquinaria() {
  return <Navigate to="/maquinaria?vista=EQUIPO" replace />;
}
