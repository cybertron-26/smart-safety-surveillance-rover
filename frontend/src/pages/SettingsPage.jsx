import React, { useState, useEffect } from 'react';
import { Settings, Shield, Bot, Sliders, Database, Save, RotateCcw, CheckCircle, Server, Activity } from 'lucide-react';

export const SettingsPage = () => {
  const [thresholds, setThresholds] = useState({
    methane: { warning: 1.0, danger: 1.5 },
    carbon_monoxide: { warning: 25.0, danger: 50.0 },
    oxygen: { warning_low: 19.5, danger_low: 18.0 },
    temperature: { warning: 35.0, danger: 45.0 },
    vibration: { warning: 0.35, danger: 0.70 }
  });
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [aiSensitivity, setAiSensitivity] = useState('Balanced');
  const [systemInfo, setSystemInfo] = useState(null);
  const [savedMsg, setSavedMsg] = useState(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          const s = data.settings;
          if (s.thresholds) setThresholds(s.thresholds);
          if (s.sim_speed) setSimSpeed(s.sim_speed);
          if (s.ai_sensitivity) setAiSensitivity(s.ai_sensitivity);
          if (s.system_info) setSystemInfo(s.system_info);
        }
      })
      .catch(err => console.error("Settings load error:", err));
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thresholds,
          sim_speed: simSpeed,
          ai_sensitivity: aiSensitivity
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSavedMsg('Settings saved & applied successfully to active system!');
        setTimeout(() => setSavedMsg(null), 4000);
      }
    } catch (err) {
      console.error("Save settings error:", err);
    }
  };

  return (
    <div className="space-y-6">
      
      {savedMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          {savedMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Col 1 & 2: Thresholds & Rover Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Prototype Safety Thresholds */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                MSHA/OSHA PROTOTYPE SAFETY THRESHOLDS
              </h3>
              <span className="text-xs font-mono text-cyan-400">HARD RULES CONFIG</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-800">
                <label className="text-xs font-mono font-bold text-slate-200 block mb-2">METHANE (CH4) LIMITS (%)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-amber-400 font-mono">Warning Threshold</span>
                    <input
                      type="number" step="0.1" value={thresholds.methane.warning}
                      onChange={e => setThresholds({...thresholds, methane: {...thresholds.methane, warning: parseFloat(e.target.value)}})}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-100"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-red-400 font-mono">Danger Limit</span>
                    <input
                      type="number" step="0.1" value={thresholds.methane.danger}
                      onChange={e => setThresholds({...thresholds, methane: {...thresholds.methane, danger: parseFloat(e.target.value)}})}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-800">
                <label className="text-xs font-mono font-bold text-slate-200 block mb-2">CARBON MONOXIDE (CO) LIMITS (ppm)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-amber-400 font-mono">Warning (ppm)</span>
                    <input
                      type="number" value={thresholds.carbon_monoxide.warning}
                      onChange={e => setThresholds({...thresholds, carbon_monoxide: {...thresholds.carbon_monoxide, warning: parseFloat(e.target.value)}})}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-100"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-red-400 font-mono">Danger (ppm)</span>
                    <input
                      type="number" value={thresholds.carbon_monoxide.danger}
                      onChange={e => setThresholds({...thresholds, carbon_monoxide: {...thresholds.carbon_monoxide, danger: parseFloat(e.target.value)}})}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-800">
                <label className="text-xs font-mono font-bold text-slate-200 block mb-2">OXYGEN (O2) MINIMUM SAFETIES (%)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-amber-400 font-mono">Warning Low (%)</span>
                    <input
                      type="number" step="0.1" value={thresholds.oxygen.warning_low}
                      onChange={e => setThresholds({...thresholds, oxygen: {...thresholds.oxygen, warning_low: parseFloat(e.target.value)}})}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-100"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-red-400 font-mono">Critical Low (%)</span>
                    <input
                      type="number" step="0.1" value={thresholds.oxygen.danger_low}
                      onChange={e => setThresholds({...thresholds, oxygen: {...thresholds.oxygen, danger_low: parseFloat(e.target.value)}})}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-800">
                <label className="text-xs font-mono font-bold text-slate-200 block mb-2">TEMPERATURE & VIBRATION</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-red-400 font-mono">Max Temp (°C)</span>
                    <input
                      type="number" value={thresholds.temperature.danger}
                      onChange={e => setThresholds({...thresholds, temperature: {...thresholds.temperature, danger: parseFloat(e.target.value)}})}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-100"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-red-400 font-mono">Max Vib (g)</span>
                    <input
                      type="number" step="0.05" value={thresholds.vibration.danger}
                      onChange={e => setThresholds({...thresholds, vibration: {...thresholds.vibration, danger: parseFloat(e.target.value)}})}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Simulation & AI Sensitivity */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                SIMULATION & AI ENGINE TUNING
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-mono font-bold text-slate-300 block mb-2">
                  SIMULATION SPEED MULTIPLIER: <span className="text-cyan-400 font-extrabold">{simSpeed}x</span>
                </label>
                <input
                  type="range" min="0.5" max="10" step="0.5" value={simSpeed}
                  onChange={e => setSimSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>0.5x (Real-time)</span>
                  <span>5.0x</span>
                  <span>10.0x (Fast)</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-slate-300 block mb-2">
                  AI ENGINE MODEL SENSITIVITY
                </label>
                <select
                  value={aiSensitivity}
                  onChange={e => setAiSensitivity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs font-mono text-cyan-400 font-bold"
                >
                  <option value="Conservative">Conservative (Low false positive threshold)</option>
                  <option value="Balanced">Balanced (Default Neural Weights)</option>
                  <option value="Aggressive">Aggressive (High early hazard detection)</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Col 3: System Diagnostics & Actions */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Server className="w-5 h-5 text-cyan-400" />
                SYSTEM DIAGNOSTICS
              </h3>
              <span className="text-xs font-mono text-emerald-400">HEALTH: 100%</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex justify-between">
                <span className="text-slate-400">BACKEND API:</span>
                <span className="text-emerald-400 font-bold">ONLINE (Python Flask)</span>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex justify-between">
                <span className="text-slate-400">DATABASE:</span>
                <span className="text-cyan-400 font-bold">SQLite 3 Persistent</span>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex justify-between">
                <span className="text-slate-400">WEBSOCKET / SSE:</span>
                <span className="text-cyan-400 font-bold">1.0s Streaming Loop</span>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex justify-between">
                <span className="text-slate-400">ACTIVE SENSOR NODES:</span>
                <span className="text-slate-100 font-bold">36 Sensors (6 Zones)</span>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex justify-between">
                <span className="text-slate-400">ROVER TELEMETRY LINK:</span>
                <span className="text-emerald-400 font-bold">CONNECTED (14ms)</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-800">
            <button
              onClick={handleSave}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs rounded-lg border border-cyan-400 shadow-lg transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              SAVE & APPLY CONFIGURATION
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
