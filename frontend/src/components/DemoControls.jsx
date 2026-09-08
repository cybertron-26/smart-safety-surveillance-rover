import React from 'react';
import { useSystem } from '../context/SystemContext';
import { Play, ShieldCheck, Flame, AlertCircle, Thermometer, CloudRain, Octagon, AlertTriangle } from 'lucide-react';

export const DemoControls = () => {
  const { telemetry, triggerDemoScenario } = useSystem();
  const currentScenario = telemetry?.scenario || 'normal';

  const scenarios = [
    { id: 'normal', label: '1. Normal Environment', icon: ShieldCheck, color: 'text-emerald-400 border-emerald-500/30' },
    { id: 'danger_gas', label: '2. Dangerous Gas/Smoke (MQ-2)', icon: Flame, color: 'text-amber-400 border-amber-500/30' },
    { id: 'toxic_gas', label: '3. Toxic Gas (MQ-135)', icon: AlertCircle, color: 'text-purple-400 border-purple-500/30' },
    { id: 'high_temp', label: '4. Excessive Temp (DHT)', icon: Thermometer, color: 'text-red-400 border-red-500/30' },
    { id: 'abnormal_humidity', label: '5. Abnormal Humidity (DHT)', icon: CloudRain, color: 'text-sky-400 border-sky-500/30' },
    { id: 'obstacle_detected', label: '6. Obstacle Detected (Ultrasonic)', icon: AlertTriangle, color: 'text-yellow-400 border-yellow-500/30' },
    { id: 'emergency_stop', label: '7. Emergency Stop Button', icon: Octagon, color: 'text-red-500 border-red-600 font-extrabold animate-pulse' },
  ];

  return (
    <div className="glass-card p-3 mb-6 border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            HARDWARE DEMO SCENARIO SIMULATOR
          </h2>
        </div>
        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
          ACTIVE SCENARIO: {currentScenario.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isActive = currentScenario === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => triggerDemoScenario(sc.id)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg text-xs font-mono transition-all border ${
                isActive
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md font-bold'
                  : 'bg-slate-900/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 mb-1 ${sc.color}`} />
              <span className="text-[11px] truncate w-full text-center">{sc.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
