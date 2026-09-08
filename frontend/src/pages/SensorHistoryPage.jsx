import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Filter, Activity, TrendingUp, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

export const SensorHistoryPage = () => {
  const [sensorType, setSensorType] = useState('methane');
  const [zoneId, setZoneId] = useState('ALL');
  const [timeRange, setTimeRange] = useState('1h');
  const [historyData, setHistoryData] = useState([]);
  const [stats, setStats] = useState({ min: 0, max: 0, avg: 0, current: 0 });
  const [loading, setLoading] = useState(true);

  const fetchSensorHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/sensors/history?sensor_type=${sensorType}&zone_id=${zoneId}&time_range=${timeRange}`);
      if (res.ok) {
        const data = await res.json();
        setHistoryData(data.history || []);
        setStats(data.stats || { min: 0, max: 0, avg: 0, current: 0 });
      }
    } catch (err) {
      console.error("Sensor history fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [sensorType, zoneId, timeRange]);

  useEffect(() => {
    fetchSensorHistory();
    const interval = setInterval(fetchSensorHistory, 5000);
    return () => clearInterval(interval);
  }, [fetchSensorHistory]);

  const sensorConfigMap = {
    methane: { label: "Methane (CH4)", unit: "%", warning: 1.0, danger: 1.5, color: "#f59e0b" },
    carbon_monoxide: { label: "Carbon Monoxide (CO)", unit: "ppm", warning: 25.0, danger: 50.0, color: "#a855f7" },
    oxygen: { label: "Oxygen (O2)", unit: "%", warning: 19.5, danger: 18.0, color: "#06b6d4" },
    temperature: { label: "Temperature", unit: "°C", warning: 35.0, danger: 45.0, color: "#ef4444" },
    vibration: { label: "Structural Vibration", unit: "g", warning: 0.35, danger: 0.70, color: "#eab308" },
    smoke_dust: { label: "Smoke & Dust Density", unit: "µg/m³", warning: 50.0, danger: 100.0, color: "#f97316" }
  };

  const currCfg = sensorConfigMap[sensorType] || sensorConfigMap.methane;

  // Render SVG Chart Polyline
  const renderSvgChart = () => {
    if (historyData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-slate-500 font-mono text-xs">
          No telemetry points logged for selected parameters
        </div>
      );
    }

    const width = 800;
    const height = 280;
    const padding = 40;

    const values = historyData.map(d => d.value);
    const minVal = Math.min(...values, 0);
    const maxVal = Math.max(...values, currCfg.danger * 1.2);
    const range = maxVal - minVal || 1;

    const points = historyData.map((d, i) => {
      const x = padding + (i / Math.max(1, historyData.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);
      return { x, y, val: d.value, time: d.timestamp };
    });

    const polylineStr = points.map(p => `${p.x},${p.y}`).join(' ');

    // Threshold Y positions
    const warnY = height - padding - ((currCfg.warning - minVal) / range) * (height - 2 * padding);
    const dangerY = height - padding - ((currCfg.danger - minVal) / range) * (height - 2 * padding);

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={currCfg.color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={currCfg.color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.05)" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.05)" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.1)" />

        {/* Warning Threshold Line */}
        <line x1={padding} y1={warnY} x2={width - padding} y2={warnY} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 5" />
        <text x={width - padding - 80} y={warnY - 5} fill="#f59e0b" fontSize="10" fontFamily="monospace">
          Warning ({currCfg.warning} {currCfg.unit})
        </text>

        {/* Danger Threshold Line */}
        <line x1={padding} y1={dangerY} x2={width - padding} y2={dangerY} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x={width - padding - 80} y={dangerY - 5} fill="#ef4444" fontSize="10" fontFamily="monospace">
          Danger ({currCfg.danger} {currCfg.unit})
        </text>

        {/* Filled Area */}
        <polygon
          points={`${padding},${height - padding} ${polylineStr} ${width - padding},${height - padding}`}
          fill="url(#chartGrad)"
        />

        {/* Telemetry Line */}
        <polyline fill="none" stroke={currCfg.color} strokeWidth="2.5" points={polylineStr} />

        {/* Points & Abnormal Markers */}
        {points.map((p, i) => {
          const isAbnormal = p.val >= currCfg.warning;
          return (
            <g key={i}>
              <circle
                cx={p.x} cy={p.y} r={isAbnormal ? 5 : 2.5}
                fill={isAbnormal ? '#ef4444' : currCfg.color}
                stroke="#ffffff" strokeWidth={isAbnormal ? 1.5 : 0}
                className={isAbnormal ? 'animate-pulse' : ''}
              />
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Controls Header & Selectors */}
      <div className="glass-card p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">
              <LineChart className="w-5 h-5 text-cyan-400" />
              ATMOSPHERIC SENSOR TELEMETRY HISTORY
            </h2>
            <p className="text-xs text-slate-400">High-resolution time-series trend analysis & abnormal event markers</p>
          </div>

          {/* Selectors Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
              <span className="text-slate-400">SENSOR:</span>
              <select
                value={sensorType}
                onChange={(e) => setSensorType(e.target.value)}
                className="bg-transparent text-cyan-400 font-bold focus:outline-none cursor-pointer"
              >
                <option value="methane" className="bg-slate-900 text-slate-200">Methane (CH4)</option>
                <option value="carbon_monoxide" className="bg-slate-900 text-slate-200">Carbon Monoxide (CO)</option>
                <option value="oxygen" className="bg-slate-900 text-slate-200">Oxygen (O2)</option>
                <option value="temperature" className="bg-slate-900 text-slate-200">Temperature</option>
                <option value="vibration" className="bg-slate-900 text-slate-200">Structural Vibration</option>
                <option value="smoke_dust" className="bg-slate-900 text-slate-200">Smoke & Dust</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
              <span className="text-slate-400">ZONE:</span>
              <select
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="bg-transparent text-cyan-400 font-bold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900 text-slate-200">All Mine Zones</option>
                <option value="Zone 1" className="bg-slate-900 text-slate-200">Zone 1 (Main Shaft)</option>
                <option value="Zone 2" className="bg-slate-900 text-slate-200">Zone 2 (Alpha Drift)</option>
                <option value="Zone 3" className="bg-slate-900 text-slate-200">Zone 3 (Excavation Face)</option>
                <option value="Zone 4" className="bg-slate-900 text-slate-200">Zone 4 (Vent Shaft)</option>
                <option value="Zone 5" className="bg-slate-900 text-slate-200">Zone 5 (Deep South)</option>
                <option value="Zone 6" className="bg-slate-900 text-slate-200">Zone 6 (Refuge Bay)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Metric Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">CURRENT VALUE</span>
            <p className="text-xl font-bold font-mono text-cyan-400 mt-1">
              {stats.current} <span className="text-xs text-slate-400">{currCfg.unit}</span>
            </p>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">AVERAGE</span>
            <p className="text-xl font-bold font-mono text-slate-200 mt-1">
              {stats.avg} <span className="text-xs text-slate-400">{currCfg.unit}</span>
            </p>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">PEAK MINIMUM</span>
            <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {stats.min} <span className="text-xs text-slate-400">{currCfg.unit}</span>
            </p>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">PEAK MAXIMUM</span>
            <p className={`text-xl font-bold font-mono mt-1 ${stats.max >= currCfg.warning ? 'text-red-400' : 'text-slate-100'}`}>
              {stats.max} <span className="text-xs text-slate-400">{currCfg.unit}</span>
            </p>
          </div>
        </div>

        {/* Main Historical Chart Canvas Container */}
        <div className="mt-6 p-4 bg-slate-950/90 rounded-xl border border-slate-800">
          {renderSvgChart()}
        </div>
      </div>

    </div>
  );
};
