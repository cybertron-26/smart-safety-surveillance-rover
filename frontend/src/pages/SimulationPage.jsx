import React from 'react';
import { useSystem } from '../context/SystemContext';
import { Play, ShieldCheck, Flame, AlertCircle, Thermometer, CloudRain, Octagon, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const SimulationPage = () => {
  const { telemetry, triggerDemoScenario } = useSystem();
  const currentScenario = telemetry?.scenario || 'normal';
  const systemStatus = telemetry?.system_status || 'SAFE';
  const isDanger = systemStatus === 'DANGER';

  const scenarios = [
    { id: 'normal', name: '1. Normal Environment', desc: 'MQ-2: 120 ppm | MQ-135: 150 ppm | Temp: 29°C | Hum: 60%', icon: ShieldCheck, color: 'text-emerald-400 border-emerald-500/30' },
    { id: 'danger_gas', name: '2. Dangerous Gas/Smoke (MQ-2)', desc: 'MQ-2 spikes to 650 ppm (> 400 ppm limit) → DANGER MODE', icon: Flame, color: 'text-amber-400 border-amber-500/30' },
    { id: 'toxic_gas', name: '3. Harmful/Toxic Gas (MQ-135)', desc: 'MQ-135 spikes to 750 ppm (> 500 ppm limit) → DANGER MODE', icon: AlertCircle, color: 'text-purple-400 border-purple-500/30' },
    { id: 'high_temp', name: '4. Excessive Temperature (DHT)', desc: 'Temperature spikes to 48°C (> 40°C limit) → DANGER MODE', icon: Thermometer, color: 'text-red-400 border-red-500/30' },
    { id: 'abnormal_humidity', name: '5. Abnormal Humidity (DHT)', desc: 'Humidity spikes to 92% (> 80% limit) → DANGER MODE', icon: CloudRain, color: 'text-sky-400 border-sky-500/30' },
    { id: 'obstacle_detected', name: '6. Obstacle Detected (Ultrasonic)', desc: 'Ultrasonic distance < 20 cm → Rover stops & avoids obstacle', icon: AlertTriangle, color: 'text-yellow-400 border-yellow-500/30' },
    { id: 'emergency_stop', name: '7. Emergency Stop Push Button', desc: 'Hardware E-Stop pressed → Motors freeze immediately', icon: Octagon, color: 'text-red-500 border-red-600 font-extrabold animate-pulse' },
  ];

  return (
    <div className="space-y-6">
      
      <div className="glass-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
          <div>
            <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2 font-mono">
              <Play className="w-5 h-5 text-cyan-400" />
              SYSTEM DEMONSTRATION & SIMULATION CONTROLS
            </h2>
            <p className="text-xs text-slate-400">Trigger exact hardware test scenarios to demonstrate SAFE and DANGER modes</p>
          </div>

          <div className={`px-4 py-2 rounded-lg font-mono text-xs font-black border ${
            isDanger ? 'bg-red-500/20 text-red-400 border-red-500/60 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
          }`}>
            CURRENT MODE: {systemStatus} MODE
          </div>
        </div>

        {/* Master Mode Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => triggerDemoScenario('normal')}
            className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
              !isDanger
                ? 'bg-emerald-950/60 border-emerald-500/80 shadow-lg shadow-emerald-950/40 font-bold'
                : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <div className="text-left">
                <span className="text-xs font-mono text-emerald-300 uppercase block font-extrabold">FORCE SAFE MODE</span>
                <span className="text-[11px] text-slate-400">Green LED ON | Red LED OFF | Buzzer OFF | "AREA SAFE – WORKERS CAN ENTER"</span>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400">SELECT</span>
          </button>

          <button
            onClick={() => triggerDemoScenario('danger_gas')}
            className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
              isDanger
                ? 'bg-red-950/80 border-red-500/80 shadow-lg shadow-red-950/40 font-bold animate-pulse'
                : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Flame className="w-6 h-6 text-red-400" />
              <div className="text-left">
                <span className="text-xs font-mono text-red-300 uppercase block font-extrabold">FORCE DANGER MODE</span>
                <span className="text-[11px] text-slate-400">Green LED OFF | Red LED ON | Buzzer ON | "DANGER – EVACUATE"</span>
              </div>
            </div>
            <span className="text-xs font-mono text-red-400">SELECT</span>
          </button>
        </div>

        {/* 7 Exact Scenario Cards */}
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
          EXACT DEMONSTRATION TEST SCENARIOS
        </h3>

        <div className="space-y-3">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            const isActive = currentScenario === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => triggerDemoScenario(sc.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-cyan-500/20 border-cyan-400 shadow-lg font-bold'
                    : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <Icon className={`w-5 h-5 ${sc.color}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 font-mono">{sc.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">{sc.desc}</p>
                  </div>
                </div>

                <button className={`px-4 py-1.5 rounded text-xs font-mono font-bold transition ${
                  isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {isActive ? 'ACTIVE NOW' : 'TRIGGER'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
