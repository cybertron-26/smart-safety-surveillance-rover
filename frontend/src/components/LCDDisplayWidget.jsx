import React from 'react';
import { Monitor } from 'lucide-react';

export const LCDDisplayWidget = ({ lcdData, isDanger }) => {
  const line1 = lcdData?.line1 || "TEMP: 29C  HUM: 60%";
  const line2 = lcdData?.line2 || "GAS: NORMAL";
  const line3 = lcdData?.line3 || "STATUS: SAFE";

  return (
    <div className={`p-4 rounded-xl border font-mono transition-all ${
      isDanger
        ? 'bg-red-950/70 border-red-500/80 shadow-lg shadow-red-950/50'
        : 'bg-emerald-950/40 border-emerald-500/50'
    }`}>
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Monitor className="w-4 h-4 text-cyan-400" />
          SIMULATED 16x2 / OLED DISPLAY SCREEN
        </div>
        <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
          HARDWARE DISPLAY
        </span>
      </div>

      <div className={`p-3 rounded-lg border font-mono text-sm leading-relaxed tracking-wider shadow-inner text-center ${
        isDanger
          ? 'bg-red-950 text-red-300 border-red-800 font-extrabold animate-pulse'
          : 'bg-emerald-950/90 text-emerald-300 border-emerald-800 font-bold'
      }`}>
        <p>[ {line1} ]</p>
        <p>[ {line2} ]</p>
        <p>[ {line3} ]</p>
      </div>
    </div>
  );
};
