import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export const StatusBadge = ({ status = 'SAFE' }) => {
  if (status === 'CRITICAL') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse">
        <ShieldAlert className="w-3.5 h-3.5" />
        CRITICAL
      </span>
    );
  }

  if (status === 'WARNING') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/50">
        <AlertTriangle className="w-3.5 h-3.5" />
        WARNING
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
      <ShieldCheck className="w-3.5 h-3.5" />
      SAFE
    </span>
  );
};
