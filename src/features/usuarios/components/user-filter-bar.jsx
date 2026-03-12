// src/features/usuarios/components/user-filter-bar.jsx
import { useState, useEffect } from 'react';
import { Input } from '@/components/form/z_index';
import { Icon } from '@/components/ui/z_index';

export const UserFilterBar = ({ onSearchChange }) => {
  const [localValue, setLocalValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => onSearchChange(localValue), 450);
    return () => clearTimeout(timer);
  }, [localValue, onSearchChange]);

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="relative flex-1 max-w-sm">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Icon name="search" size="sm" className="text-slate-400" />
        </div>
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder="Buscar por nombre o usuario…"
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white
                     focus:outline-none focus:ring-2 focus:ring-marca-secundario/30
                     focus:border-marca-secundario transition-all placeholder:text-slate-400"
        />
        {localValue && (
          <button
            onClick={() => setLocalValue('')}
            className="absolute inset-y-0 right-2 flex items-center px-1 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <Icon name="close" size="xs" />
          </button>
        )}
      </div>
    </div>
  );
};