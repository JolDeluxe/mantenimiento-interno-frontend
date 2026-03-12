import { Badge } from '@/components/ui/z_index';

export const UserStatusBadge = ({ estatus }) => {
  // Mapeamos el estatus de base de datos a los tokens definidos en tu badge.jsx
  const statusToken = estatus === "ACTIVO" ? "resuelto" : "cancelada";
  
  return (
    <Badge status={statusToken}>
      {estatus}
    </Badge>
  );
};