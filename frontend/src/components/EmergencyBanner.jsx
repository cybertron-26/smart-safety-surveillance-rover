import React from 'react';
import { useSystem } from '../context/SystemContext';
import { AlertOctagon, CheckCircle2, Volume2, ShieldAlert } from 'lucide-react';

export const EmergencyBanner = () => {
  const { telemetry, toggleEStop } = useSystem();

  const isDanger = telemetry?.system_status === "DANGER";
  const isEstop = telemetry?.rover?.estop_active;
  const displayText = telemetry?.display_text || (isDanger ? "DANGER – EVACUATE" : "AREA SAFE – WORKERS CAN ENTER");
  const triggers = telemetry?.triggers || [];

  if (isDanger || isEstop) {
    return (
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-y border-red-500/80 px-4 py-3 shadow-2xl shadow-red-900/50 animate-pulse text-white sticky top-[113px] z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-full animate-ping">
              <AlertOctagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-mono font-extrabold text-base uppercase tracking-wider text-red-100">
                <span>🚨 DANGER MODE ACTIVE — {displayText}</span>
              </div>
              <p className="text-xs text-red-200 mt-0.5 font-mono">
                {triggers.length > 0 ? triggers[0].message : "Environmental sensor reading exceeds safety threshold! Workers must evacuate immediately!"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEstop ? (
              <button
                onClick={() => toggleEStop(false)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 font-mono text-xs font-bold rounded-lg border border-emerald-400 shadow-lg transition"
              >
                RESET / RELEASE E-STOP
              </button>
            ) : (
              <button
                onClick={() => toggleEStop(true)}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 font-mono text-xs font-bold rounded-lg border border-red-300 shadow-lg transition animate-bounce"
              >
                ENGAGE EMERGENCY STOP
              </button>
            )}
          </div>

        </div>
      </div>
    );
  }

  // SAFE MODE Banner
  return (
    <div className="bg-emerald-950/70 border-y border-emerald-500/40 px-4 py-2.5 text-white sticky top-[113px] z-20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div className="font-mono text-xs font-bold text-emerald-200 flex items-center gap-2">
            <span>SAFE MODE:</span>
            <span className="text-emerald-400 text-sm font-extrabold tracking-wide uppercase">
              "{displayText}"
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-900/60 border border-emerald-700 text-emerald-300 font-bold">
            🟢 GREEN LED: ON
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
            🔴 RED LED: OFF
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
            🔊 BUZZER: OFF
          </span>
        </div>
      </div>
    </div>
  );
};
