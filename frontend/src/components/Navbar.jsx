import React, { useState, useEffect } from 'react';
import { useSystem } from '../context/SystemContext';
import { Activity, ShieldCheck, ShieldAlert, Wifi, WifiOff, Volume2, VolumeX } from 'lucide-react';

export const Navbar = () => {
  const { telemetry, connected, soundEnabled, setSoundEnabled } = useSystem();
  const [timeStr, setTimeStr] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTimeStr(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const systemStatus = telemetry?.system_status || "SAFE";
  const isDanger = systemStatus === "DANGER";
  const isEstop = telemetry?.rover?.estop_active;

  return (
    <header className={`border-b transition-all duration-300 ${isDanger ? 'bg-red-950/50 border-red-500/60' : 'bg-slate-900/90 border-slate-800'} backdrop-blur-md sticky top-0 z-40 px-4 py-3`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isDanger ? 'bg-red-500 text-white animate-pulse' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'}`}>
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg text-slate-100 flex items-center gap-2">
              ROVER SAFETY SURVEILLANCE STATION
            </h1>
            <p className="text-xs text-slate-400">Industrial & Mining Hazardous Area Monitoring Station</p>
          </div>
        </div>

        {/* Center System Status & Display Banner */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-500">STATION TIME:</span>
            <span className="text-cyan-400 font-semibold">{timeStr}</span>
          </div>

          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono text-xs font-extrabold ${
            isDanger ? 'bg-red-500/20 text-red-400 border-red-500/60 animate-pulse' :
            'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
          }`}>
            {isDanger ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            SYSTEM STATUS: {systemStatus}
          </div>

          {isEstop && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white font-mono text-xs font-bold rounded-lg animate-bounce">
              🚨 EMERGENCY STOP ACTIVE
            </div>
          )}
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title={soundEnabled ? "Mute Buzzer Siren" : "Enable Buzzer Siren"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono border ${
            connected ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800' : 'bg-red-950/50 text-red-400 border-red-800'
          }`}>
            {connected ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-red-400 animate-pulse" />}
            <span>{connected ? 'CONNECTED (Wi-Fi/BT)' : 'DISCONNECTED'}</span>
          </div>
        </div>

      </div>
    </header>
  );
};
