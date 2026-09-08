import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { ShieldAlert, Users, Bot, Flame, Shield, Radio, Wind, AlertTriangle, Crosshair } from 'lucide-react';

export const MineMap = () => {
  const { telemetry } = useSystem();
  const [selectedZoneId, setSelectedZoneId] = useState('Zone 3');

  const sensorData = telemetry?.sensor_data || {};
  const rover = telemetry?.rover || { pos_x: 120, pos_y: 80, zone_id: 'Zone 1' };
  const workers = telemetry?.workers || [];
  const aiAnalysis = telemetry?.ai_analysis || {};

  const zones = [
    { id: "Zone 1", name: "Main Entrance & Shaft A", x: 60, y: 50, w: 180, h: 110, refuge: true, exit: true },
    { id: "Zone 2", name: "Alpha Haulage Drift", x: 280, y: 50, w: 220, h: 110, refuge: false, exit: false },
    { id: "Zone 3", name: "Excavation Face 3B", x: 550, y: 50, w: 200, h: 140, refuge: false, exit: false },
    { id: "Zone 4", name: "Ventilation Shaft & Storage", x: 280, y: 220, w: 220, h: 120, refuge: true, exit: true },
    { id: "Zone 5", name: "Deep South Tunnel", x: 60, y: 220, w: 180, h: 140, refuge: false, exit: false },
    { id: "Zone 6", name: "Refuge Chamber Beta", x: 550, y: 230, w: 200, h: 130, refuge: true, exit: true },
  ];

  const tunnels = [
    { x1: 240, y1: 105, x2: 280, y2: 105 }, // 1 -> 2
    { x1: 500, y1: 105, x2: 550, y2: 105 }, // 2 -> 3
    { x1: 390, y1: 160, x2: 390, y2: 220 }, // 2 -> 4
    { x1: 150, y1: 160, x2: 150, y2: 220 }, // 1 -> 5
    { x1: 240, y1: 280, x2: 280, y2: 280 }, // 5 -> 4
    { x1: 500, y1: 280, x2: 550, y2: 280 }, // 4 -> 6
    { x1: 650, y1: 190, x2: 650, y2: 230 }, // 3 -> 6
  ];

  const getZoneHazardStatus = (zid) => {
    const s = sensorData[zid] || {};
    if (s.methane >= 1.5 || s.carbon_monoxide >= 50 || s.vibration >= 0.70 || s.temperature >= 45) return 'CRITICAL';
    if (s.methane >= 1.0 || s.carbon_monoxide >= 25 || s.vibration >= 0.35 || s.temperature >= 35) return 'WARNING';
    return 'SAFE';
  };

  const selectedMetrics = sensorData[selectedZoneId] || {
    methane: 0.12, carbon_monoxide: 4.5, oxygen: 20.85, temperature: 22.4, vibration: 0.03, humidity: 62.0, smoke_dust: 12.0
  };
  const selectedZoneObj = zones.find(z => z.id === selectedZoneId) || zones[0];
  const workersInSelected = workers.filter(w => w.zone_id === selectedZoneId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* SVG Map Main Container */}
      <div className="lg:col-span-2 glass-card p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-cyan-400" />
              SUBTERRANEAN MINE TACTICAL MAP
            </h2>
            <p className="text-xs text-slate-400">Real-time RFID worker tracking, autonomous rover vector & atmospheric safety grid</p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-400"></span> Safe</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/40 border border-amber-400"></span> Warning</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/60 border border-red-500 animate-pulse"></span> Hazard</span>
          </div>
        </div>

        {/* Interactive SVG Underground Diagram */}
        <div className="relative bg-slate-950/90 rounded-xl border border-slate-800 p-2 overflow-hidden shadow-2xl">
          <svg viewBox="0 0 800 400" className="w-full h-auto">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
              </pattern>
            </defs>

            <rect width="800" height="400" fill="url(#grid)" />

            {/* Tunnel Connections */}
            {tunnels.map((t, idx) => (
              <line
                key={idx}
                x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                stroke="#334155" strokeWidth="14" strokeLinecap="round"
              />
            ))}
            {tunnels.map((t, idx) => (
              <line
                key={`inner-${idx}`}
                x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 4" opacity="0.6"
              />
            ))}

            {/* Zones Render */}
            {zones.map((zone) => {
              const hazard = getZoneHazardStatus(zone.id);
              const isSelected = selectedZoneId === zone.id;

              let fillColor = 'rgba(16, 185, 129, 0.1)';
              let strokeColor = '#10b981';
              if (hazard === 'WARNING') {
                fillColor = 'rgba(245, 158, 11, 0.2)';
                strokeColor = '#f59e0b';
              } else if (hazard === 'CRITICAL') {
                fillColor = 'rgba(239, 68, 68, 0.35)';
                strokeColor = '#ef4444';
              }

              return (
                <g key={zone.id} onClick={() => setSelectedZoneId(zone.id)} className="cursor-pointer">
                  <rect
                    x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx="8"
                    fill={fillColor}
                    stroke={isSelected ? '#06b6d4' : strokeColor}
                    strokeWidth={isSelected ? "3.5" : "2"}
                    className={`transition-all ${hazard === 'CRITICAL' ? 'animate-pulse' : ''}`}
                  />

                  {/* Zone Header Label */}
                  <text x={zone.x + 10} y={zone.y + 22} fill="#e2e8f0" fontSize="12" fontWeight="bold" fontFamily="monospace">
                    {zone.id}: {zone.name}
                  </text>

                  {/* Badges inside zone */}
                  {zone.refuge && (
                    <g transform={`translate(${zone.x + zone.w - 55}, ${zone.y + 8})`}>
                      <rect width="48" height="16" rx="4" fill="#065f46" stroke="#10b981" strokeWidth="0.8" />
                      <text x="5" y="12" fill="#34d399" fontSize="9" fontWeight="bold">REFUGE</text>
                    </g>
                  )}

                  {/* Zone Environmental Metrics Summary */}
                  {sensorData[zone.id] && (
                    <g transform={`translate(${zone.x + 10}, ${zone.y + 42})`}>
                      <text fill="#94a3b8" fontSize="10" fontFamily="monospace">
                        CH4: <tspan fill={sensorData[zone.id].methane >= 1.0 ? '#ef4444' : '#38bdf8'} fontWeight="bold">{sensorData[zone.id].methane.toFixed(2)}%</tspan>
                      </text>
                      <text y="16" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                        CO: <tspan fill={sensorData[zone.id].carbon_monoxide >= 25 ? '#ef4444' : '#38bdf8'} fontWeight="bold">{sensorData[zone.id].carbon_monoxide.toFixed(1)} ppm</tspan>
                      </text>
                      <text y="32" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                        TEMP: <tspan fill="#38bdf8">{sensorData[zone.id].temperature.toFixed(1)}°C</tspan>
                      </text>
                    </g>
                  )}

                  {/* Hazard Marker Icon */}
                  {hazard === 'CRITICAL' && (
                    <g transform={`translate(${zone.x + zone.w - 30}, ${zone.y + zone.h - 30})`} className="animate-bounce">
                      <circle r="12" fill="#ef4444" />
                      <text x="-4" y="4" fill="#ffffff" fontSize="12" fontWeight="bold">!</text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Workers Render */}
            {workers.map((w) => (
              <g key={w.id} transform={`translate(${w.pos_x}, ${w.pos_y})`} title={`${w.name} (${w.role})`}>
                <circle r="9" fill="#1e293b" stroke="#06b6d4" strokeWidth="2" />
                <circle r="4" fill={w.helmet_status === 'OK' ? '#10b981' : '#ef4444'} className="animate-ping" />
                <text x="12" y="4" fill="#cbd5e1" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  {w.id}
                </text>
              </g>
            ))}

            {/* Autonomous Rover Marker */}
            <g transform={`translate(${rover.pos_x}, ${rover.pos_y})`}>
              <circle r="16" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="3 3" className="animate-spin" />
              <circle r="10" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />
              <text x="18" y="-4" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                🤖 ROVER ALPHA
              </text>
              <text x="18" y="8" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                BAT: {rover.battery?.toFixed(0)}%
              </text>
            </g>

          </svg>
        </div>
      </div>

      {/* Selected Zone Side Drawer / Detail Card */}
      <div className="glass-card p-5 flex flex-col justify-between border-l border-slate-800">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">SELECTED ZONE METRICS</span>
              <h3 className="text-xl font-bold text-slate-100">{selectedZoneObj.name}</h3>
            </div>
            <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
              getZoneHazardStatus(selectedZoneId) === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
              getZoneHazardStatus(selectedZoneId) === 'WARNING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' :
              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {getZoneHazardStatus(selectedZoneId)}
            </span>
          </div>

          {/* Environmental Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Methane (CH4)</span>
                <Flame className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className={`text-lg font-bold font-mono ${selectedMetrics.methane >= 1.5 ? 'text-red-400' : 'text-slate-100'}`}>
                {selectedMetrics.methane.toFixed(2)} %
              </p>
              <span className="text-[10px] text-slate-500">Limit: 1.5%</span>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Carbon Monoxide</span>
                <Wind className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <p className={`text-lg font-bold font-mono ${selectedMetrics.carbon_monoxide >= 50 ? 'text-red-400' : 'text-slate-100'}`}>
                {selectedMetrics.carbon_monoxide.toFixed(1)} ppm
              </p>
              <span className="text-[10px] text-slate-500">Limit: 50 ppm</span>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Oxygen (O2)</span>
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <p className="text-lg font-bold font-mono text-emerald-400">
                {selectedMetrics.oxygen.toFixed(2)} %
              </p>
              <span className="text-[10px] text-slate-500">Min safe: 19.5%</span>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Temperature</span>
                <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
              </div>
              <p className="text-lg font-bold font-mono text-slate-100">
                {selectedMetrics.temperature.toFixed(1)} °C
              </p>
              <span className="text-[10px] text-slate-500">Limit: 45°C</span>
            </div>
          </div>

          {/* Workers in Zone List */}
          <div>
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              PERSONNEL IN ZONE ({workersInSelected.length})
            </h4>

            {workersInSelected.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-900/50 rounded border border-slate-800">
                No active workers tracked in {selectedZoneId}
              </p>
            ) : (
              <div className="space-y-2">
                {workersInSelected.map((w) => (
                  <div key={w.id} className="p-2.5 bg-slate-900/90 rounded border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-200">{w.name} <span className="font-mono text-cyan-400">({w.id})</span></p>
                      <p className="text-[10px] text-slate-400">{w.role}</p>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-semibold">{w.heart_rate} BPM</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Refuge Bay & Emergency Exit Info */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>REFUGE BAY: {selectedZoneObj.refuge ? 'YES (CHAMBER READY)' : 'NONE'}</span>
          <span>ESCAPE EXIT: {selectedZoneObj.exit ? 'CLEAR' : 'N/A'}</span>
        </div>

      </div>

    </div>
  );
};
