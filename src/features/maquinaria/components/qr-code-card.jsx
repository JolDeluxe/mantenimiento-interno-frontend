import React from 'react';

export const QrCodeCard = ({ maquina }) => {
  if (!maquina) return null;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `${window.location.origin}/hoy/todas?prefill=${maquina.codigo}`
  )}`;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-300 rounded-2xl shadow-sm max-w-[220px] text-center print:break-inside-avoid print:border-slate-400 print:shadow-none mx-auto w-full print:max-w-[160px] print:p-3 print:rounded-lg">
      <div className="text-xs font-mono font-black text-marca-primario print:text-black mb-0.5 tracking-wider print:text-[10px]">
        {maquina.codigo}
      </div>
      <div className="text-xs font-black text-slate-800 uppercase tracking-tight w-full mb-3 print:text-black leading-tight print:text-[9px] print:mb-2 whitespace-normal break-words min-h-[2rem] flex items-center justify-center">
        {maquina.nombre}
      </div>
      <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-center shadow-inner relative print:bg-white print:border-none print:p-0 print:shadow-none">
        <img
          src={qrUrl}
          width="140"
          height="140"
          alt={`QR ${maquina.codigo}`}
          className="mix-blend-multiply print:w-[100px] print:h-[100px]"
        />
      </div>
      <div className="text-[9px] text-slate-400 font-bold mt-2.5 leading-tight uppercase tracking-wider print:text-slate-500 print:text-[8px] print:mt-1.5">
        Escanee para reportar falla
      </div>
    </div>
  );
};
