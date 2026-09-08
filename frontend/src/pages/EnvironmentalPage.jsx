import React, { useState, useEffect } from 'react';
import { useSystem } from '../context/SystemContext';
import { Flame, AlertCircle, Thermometer, CloudRain, LineChart } from 'lucide-react';

export const EnvironmentalPage = () => {
  const { telemetry } = useSystem();
  const [activeSensor, setActiveSensor] = useState('mq2_smoke_gas');
  const [history, setHistory] = useState([]);

  const sensors = telemetry?.sensors || { mq2_smoke_gas: 120.0, mq135_toxic_gas: 150.0, temperature: 29.0, humidity: 60.0 };
  const thresholds = telemetry?.thresholds || { mq2_smoke_gas: { danger: 400.0 }, mq135_toxic_gas: { danger: 500.0 }, temperature: { danger: 40.0 }, humidity: { danger: 80.0 } };

  useEffect(() => {
    fetch(`/api/sensors/history?sensor_type=${activeSensor}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') setHistory(data.history || []);
      })
      .catch(err => console.error("Fetch sensor history error:", err));

    const interval = setInterval(() => {
      fetch(`/api/sensors/history?sensor_type=${activeSensor}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') setHistory(data.history || []);
        });
    }, 4000);

    return () => clearInterval(interval);
  }, [activeSensor]);

  const sensorMeta = {
    mq2_smoke_gas: { label: "MQ-2 Smoke/Gas Sensor", unit: "ppm", danger: thresholds.mq2_smoke_gas.danger, color: "#f59e0b" },
    mq135_toxic_gas: { label: "MQ-135 Harmful/Toxic Gas Sensor", unit: "ppm", danger: thresholds.mq135_toxic_gas.danger, color: "#a855f7" },
    temperature: { label: "DHT11/DHT22 Temperature Sensor", unit: "°C", danger: thresholds.temperature.danger, color: "#ef4444" },
    humidity: { label: "DHT11/DHT22 Humidity Sensor", unit: "%", danger: thresholds.humidity.danger, color: "#38bdf8" }
  };

  const currentMeta = sensorMeta[activeSensor];

  // SVG Line Chart Renderer
  const renderChartSvg = () => {
    if (history.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-slate-500 font-mono text-xs">
          Logging environmental telemetry...
        </div>
      );
    }

    const width = 800;
    const height = 260;
    const padding = 40;

    const values = history.map(d => d.value);
    const minVal = Math.min(...values, 0);
    const maxVal = Math.max(...values, currentMeta.danger * 1.25);
    const range = maxVal - minVal || 1;

    const points = history.map((d, i) => {
      const x = padding + (i / Math.max(1, history.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);
      return { x, y, val: d.value };
    });

    const polylineStr = points.map(p => `${p.x},${p.y}`).join(' ');
    const dangerY = height - padding - ((currentMeta.danger - minVal) / range) * (height - 2 * padding);

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="envGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={currentMeta.color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={currentMeta.color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.05)" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.05)" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.1)" />

        {/* Prototype Threshold Line */}
        <line x1={padding} y1={dangerY} x2={width - padding} y2={dangerY} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" />
        <text x={width - padding - 170} y={dangerY - 6} fill="#ef4444" fontSize="10" fontFamily="monospace" fontWeight="bold">
          Prototype Threshold ({currentMeta.danger} {currentMeta.unit})
        </text>

        {/* Area & Polyline */}
        <polygon points={`${padding},${height - padding} ${polylineStr} ${width - padding},${height - padding}`} fill="url(#envGrad)" />
        <polyline fill="none" stroke={currentMeta.color} strokeWidth="2.5" points={polylineStr} />

        {/* Points */}
        {points.map((p, i) => {
          const isDanger = p.val > currentMeta.danger;
          return (
            <circle
              key={i} cx={p.x} cy={p.y} r={isDanger ? 4.5 : 2.5}
              fill={isDanger ? '#ef4444' : currentMeta.color}
              stroke="#ffffff" strokeWidth={isDanger ? 1.5 : 0}
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top 4 Sensor Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* MQ-2 */}
        <div 
          onClick={() => setActiveSensor('mq2_smoke_gas')}
          className={`glass-card p-4 border cursor-pointer transition-all ${
            activeSensor === 'mq2_smoke_gas' ? 'border-cyan-400 shadow-lg shadow-cyan-500/10' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>MQ-2 SMOKE/GAS</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <p className={`text-2xl font-bold font-mono ${sensors.mq2_smoke_gas > thresholds.mq2_smoke_gas.danger ? 'text-red-400' : 'text-slate-100'}`}>
            {sensors.mq2_smoke_gas.toFixed(1)} <span className="text-xs text-slate-400">ppm</span>
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex justify-between text-[10px] font-mono">
            <span className="text-slate-500">Threshold: {thresholds.mq2_smoke_gas.danger} ppm</span>
            <span className={sensors.mq2_smoke_gas > thresholds.mq2_smoke_gas.danger ? "text-red-400 font-bold" : "text-emerald-400"}>
              {sensors.mq2_smoke_gas > thresholds.mq2_smoke_gas.danger ? "DANGER" : "NORMAL"}
            </span>
          </div>
        </div>

        {/* MQ-135 */}
        <div 
          onClick={() => setActiveSensor('mq135_toxic_gas')}
          className={`glass-card p-4 border cursor-pointer transition-all ${
            activeSensor === 'mq135_toxic_gas' ? 'border-cyan-400 shadow-lg shadow-cyan-500/10' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>MQ-135 TOXIC GAS</span>
            <AlertCircle className="w-4 h-4 text-purple-400" />
          </div>
          <p className={`text-2xl font-bold font-mono ${sensors.mq135_toxic_gas > thresholds.mq135_toxic_gas.danger ? 'text-red-400' : 'text-slate-100'}`}>
            {sensors.mq135_toxic_gas.toFixed(1)} <span className="text-xs text-slate-400">ppm</span>
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex justify-between text-[10px] font-mono">
            <span className="text-slate-500">Threshold: {thresholds.mq135_toxic_gas.danger} ppm</span>
            <span className={sensors.mq135_toxic_gas > thresholds.mq135_toxic_gas.danger ? "text-red-400 font-bold" : "text-emerald-400"}>
              {sensors.mq135_toxic_gas > thresholds.mq135_toxic_gas.danger ? "DANGER" : "NORMAL"}
            </span>
          </div>
        </div>

        {/* DHT Temperature */}
        <div 
          onClick={() => setActiveSensor('temperature')}
          className={`glass-card p-4 border cursor-pointer transition-all ${
            activeSensor === 'temperature' ? 'border-cyan-400 shadow-lg shadow-cyan-500/10' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>DHT TEMPERATURE</span>
            <Thermometer className="w-4 h-4 text-red-400" />
          </div>
          <p className={`text-2xl font-bold font-mono ${sensors.temperature > thresholds.temperature.danger ? 'text-red-400' : 'text-slate-100'}`}>
            {sensors.temperature.toFixed(1)} <span className="text-xs text-slate-400">°C</span>
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex justify-between text-[10px] font-mono">
            <span className="text-slate-500">Threshold: {thresholds.temperature.danger} °C</span>
            <span className={sensors.temperature > thresholds.temperature.danger ? "text-red-400 font-bold" : "text-emerald-400"}>
              {sensors.temperature > thresholds.temperature.danger ? "DANGER" : "NORMAL"}
            </span>
          </div>
        </div>

        {/* DHT Humidity */}
        <div 
          onClick={() => setActiveSensor('humidity')}
          className={`glass-card p-4 border cursor-pointer transition-all ${
            activeSensor === 'humidity' ? 'border-cyan-400 shadow-lg shadow-cyan-500/10' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>DHT HUMIDITY</span>
            <CloudRain className="w-4 h-4 text-sky-400" />
          </div>
          <p className={`text-2xl font-bold font-mono ${sensors.humidity > thresholds.humidity.danger ? 'text-red-400' : 'text-slate-100'}`}>
            {sensors.humidity.toFixed(1)} <span className="text-xs text-slate-400">%</span>
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex justify-between text-[10px] font-mono">
            <span className="text-slate-500">Threshold: {thresholds.humidity.danger}%</span>
            <span className={sensors.humidity > thresholds.humidity.danger ? "text-red-400 font-bold" : "text-emerald-400"}>
              {sensors.humidity > thresholds.humidity.danger ? "DANGER" : "NORMAL"}
            </span>
          </div>
        </div>

      </div>

      {/* Live Chart View */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-slate-100 flex items-center gap-2 font-mono text-sm">
              <LineChart className="w-4 h-4 text-cyan-400" />
              LIVE TELEMETRY CHART — {currentMeta.label.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-400">Real-time sensor readings compared against prototype safety threshold</p>
          </div>

          <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-3 py-1 rounded border border-cyan-800 font-bold">
            PROTOTYPE THRESHOLD: {currentMeta.danger} {currentMeta.unit}
          </span>
        </div>

        <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-800">
          {renderChartSvg()}
        </div>
      </div>

    </div>
  );
};
