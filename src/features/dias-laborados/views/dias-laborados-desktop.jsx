import { DiasLaboradosTable } from '../components/dias-laborados-table';

export function DiasLaboradosDesktop({ rows, annual, loading }) {
  return <DiasLaboradosTable rows={rows} annual={annual} loading={loading} />;
}

