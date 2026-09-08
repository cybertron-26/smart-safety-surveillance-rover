import React from 'react';
import { useSystem } from '../context/SystemContext';
import { LCDDisplayWidget } from '../components/LCDDisplayWidget';
import { ShieldCheck, ShieldAlert, Flame, AlertCircle, Thermometer, CloudRain, Cpu, Radio, Eye, AlertTriangle, Users, Volume2, CheckCircle2 } from 'lucide-react';

export const Dashboard = () => {
  const { telemetry } = useSystem();
  const systemStatus = telemetry?.system_status || "SAFE";
  const isDanger = systemStatus === "DANGER";
  const isEstop = telemetry?.rover?.estop_active;
  const sensors = telemetry?.sensors || { mq2_smoke_gas: 120.0, mq135_toxic_gas: 150.0, temperature: 29.0, humidity: 60.0 };
  const thresholds = telemetry?.thresholds || { mq2_smoke_gas: { danger: 400.0 }, mq135_toxic_gas: { danger: 500.0 }, temperature: { danger: 40.0 }, humidity: { danger: 80.0 } };
  const hw = telemetry?.hardware_indicators || { green_led: "ON", red_led: "OFF", buzzer: "OFF" };
  const indicators = telemetry?.indicators || { camera: "ACTIVE", obstacle_detection: "ACTIVE", communication: "CONNECTED" };

  return (
    <div className="space-y-6">
      
      {/* Worker Entry Communication Banner */}
      <div className={`p-5 rounded-xl border shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
        isDanger
          ? 'bg-red-950/70 border-red-500/80 shadow-red-950/50 animate-pulse'
          : 'bg-emerald-950/60 border-emerald-500/50 shadow-emerald-950/20'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${isDanger ? 'bg-red-600 text-white animate-ping' : 'bg-emerald-600 text-white'}`}>
            {isDanger ? <ShieldAlert className="w-8 h-8" /> : <Users className="w-8 h-8" />}
          </div>
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block">WORKER ENTRY ADVISORY STATUS</span>
            <h2 className={`text-2xl font-black font-mono tracking-wide ${isDanger ? 'text-red-300' : 'text-emerald-300'}`}>
              {isDanger ? "DANGER – EVACUATE IMMEDIATELY!" : "AREA SAFE – WORKERS CAN ENTER"}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {isDanger
                ? "Subterranean environmental hazards exceed configured prototype thresholds! All personnel must evacuate!"
                : "Rover inspection completed. Environment parameters nominal. Personnel authorized to enter area."
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-lg font-mono text-sm font-black border ${
            isDanger ? 'bg-red-600 text-white border-red-400' : 'bg-emerald-600 text-white border-emerald-400'
          }`}>
            OPERATING MODE: {systemStatus} MODE
          </span>
        </div>
      </div>

      {/* Main Grid: Status Cards & Local Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hardware Status Overview */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm font-mono">
              <Cpu className="w-4 h-4 text-cyan-400" />
              SYSTEM STATUS OVERVIEW
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              ARDUINO / ESP32
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">SYSTEM STATUS:</span>
              <span className={`font-bold px-2 py-0.5 rounded ${isDanger ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'}`}>
                {systemStatus}
              </span>
            </div>

            <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">ROVER STATUS:</span>
              <span className="text-cyan-400 font-bold">{telemetry?.rover?.movement_status || "PATROLLING"}</span>
            </div>

            <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">CONTROLLER:</span>
              <span className="text-slate-200 font-bold">{telemetry?.rover?.controller || "Arduino Uno / ESP32"}</span>
            </div>

            <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">MONITORING STATUS:</span>
              <span className="text-emerald-400 font-bold">ACTIVE CONTINUOUS</span>
            </div>

            <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">EMERGENCY STATUS:</span>
              <span className={isEstop ? "text-red-400 font-bold animate-pulse" : "text-slate-300"}>
                {isEstop ? "EMERGENCY STOP ACTIVE" : "NONE (NORMAL)"}
              </span>
            </div>
          </div>
        </div>

        {/* Hardware LEDs & Buzzer Output Card */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm font-mono">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              HARDWARE ACTUATOR OUTPUTS
            </h3>
            <span className="text-[10px] font-mono text-slate-400">REAL HARDWARE</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center font-mono">
            <div className={`p-4 rounded-xl border flex flex-col items-center justify-center ${
              hw.green_led === "ON" ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300 shadow-lg shadow-emerald-950/40' : 'bg-slate-900/60 border-slate-800 opacity-40'
            }`}>
              <div className={`w-8 h-8 rounded-full mb-2 ${hw.green_led === "ON" ? 'bg-emerald-400 shadow-lg shadow-emerald-400/80 animate-pulse' : 'bg-slate-700'}`} />
              <span className="text-[10px] text-slate-400">GREEN LED</span>
              <strong className="text-xs mt-0.5">{hw.green_led}</strong>
            </div>

            <div className={`p-4 rounded-xl border flex flex-col items-center justify-center ${
              hw.red_led === "ON" ? 'bg-red-950/80 border-red-500/80 text-red-300 shadow-lg shadow-red-950/40 animate-pulse' : 'bg-slate-900/60 border-slate-800 opacity-40'
            }`}>
              <div className={`w-8 h-8 rounded-full mb-2 ${hw.red_led === "ON" ? 'bg-red-500 shadow-lg shadow-red-500/80 animate-ping' : 'bg-slate-700'}`} />
              <span className="text-[10px] text-slate-400">RED LED</span>
              <strong className="text-xs mt-0.5">{hw.red_led}</strong>
            </div>

            <div className={`p-4 rounded-xl border flex flex-col items-center justify-center ${
              hw.buzzer === "ON" ? 'bg-red-950/80 border-red-500/80 text-red-300 shadow-lg shadow-red-950/40 animate-pulse' : 'bg-slate-900/60 border-slate-800 opacity-40'
            }`}>
              <div className={`w-8 h-8 rounded-full mb-2 flex items-center justify-center ${hw.buzzer === "ON" ? 'bg-amber-500 text-slate-950 font-bold animate-bounce' : 'bg-slate-700 text-slate-500'}`}>
                🔊
              </div>
              <span className="text-[10px] text-slate-400">BUZZER</span>
              <strong className="text-xs mt-0.5">{hw.buzzer}</strong>
            </div>
          </div>

          <div className="pt-2">
            <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 flex justify-between text-xs font-mono">
              <span className="text-slate-400">HARDWARE DISPLAY TEXT:</span>
              <span className="text-cyan-300 font-bold">{telemetry?.display_text || "AREA SAFE – WORKERS CAN ENTER"}</span>
            </div>
          </div>
        </div>

        {/* Local Simulated 16x2 / OLED Display */}
        <div className="glass-card p-5">
          <LCDDisplayWidget lcdData={hw.lcd_display} isDanger={isDanger} />

          <div className="mt-4 space-y-2 text-xs font-mono">
            <div className="p-2 bg-slate-900/80 rounded border border-slate-800 flex justify-between">
              <span className="text-slate-400">CAMERA MODULE:</span>
              <span className="text-emerald-400 font-bold">{indicators.camera}</span>
            </div>
            <div className="p-2 bg-slate-900/80 rounded border border-slate-800 flex justify-between">
              <span className="text-slate-400">OBSTACLE DETECTION:</span>
              <span className={sensors.obstacle_detected ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                {sensors.obstacle_detected ? "OBSTACLE DETECTED" : "ACTIVE (CLEAR)"}
              </span>
            </div>
            <div className="p-2 bg-slate-900/80 rounded border border-slate-800 flex justify-between">
              <span className="text-slate-400">REMOTE COMMS:</span>
              <span className="text-emerald-400 font-bold">{indicators.communication}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Environmental Sensor Readings Summary Cards */}
      <div>
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-cyan-400" />
          SPECIFIED ENVIRONMENTAL SENSOR METRICS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* MQ-2 Smoke/Gas Card */}
          <div className={`glass-card p-4 border transition-all ${
            sensors.mq2_smoke_gas > thresholds.mq2_smoke_gas.danger
              ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-950/40 animate-pulse'
              : 'border-slate-800'
          }`}>
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

          {/* MQ-135 Toxic Gas Card */}
          <div className={`glass-card p-4 border transition-all ${
            sensors.mq135_toxic_gas > thresholds.mq135_toxic_gas.danger
              ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-950/40 animate-pulse'
              : 'border-slate-800'
          }`}>
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

          {/* DHT Temperature Card */}
          <div className={`glass-card p-4 border transition-all ${
            sensors.temperature > thresholds.temperature.danger
              ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-950/40 animate-pulse'
              : 'border-slate-800'
          }`}>
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

          {/* DHT Humidity Card */}
          <div className={`glass-card p-4 border transition-all ${
            sensors.humidity > thresholds.humidity.danger
              ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-950/40 animate-pulse'
              : 'border-slate-800'
          }`}>
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
      </div>

    </div>
  );
};
