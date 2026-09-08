import React from 'react';
import { useSystem } from '../context/SystemContext';
import { Bot, Cpu, Gauge, Wifi, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Octagon, AlertTriangle, ShieldCheck } from 'lucide-react';

export const RoverPage = () => {
  const { telemetry, controlRover, toggleEStop } = useSystem();
  const rover = telemetry?.rover || {
    id: "SAFETY-ROVER-01",
    controller: "Arduino Uno / ESP32",
    motor_driver: "L298N Dual Motor Driver",
    left_motor: "FORWARD",
    right_motor: "FORWARD",
    movement_status: "PATROLLING",
    camera_servo_angle: "CENTER",
    obstacle_status: "CLEAR",
    estop_active: false,
    comms_status: "CONNECTED"
  };
  const sensors = telemetry?.sensors || { ultrasonic_front: 120.0, ultrasonic_left: 140.0, ultrasonic_right: 130.0, obstacle_detected: false };
  const isEstop = rover.estop_active;

  return (
    <div className="space-y-6">
      
      {/* Top Hardware Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/30">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">MAIN CONTROLLER</span>
            <p className="text-sm font-bold font-mono text-slate-100">{rover.controller}</p>
            <span className="text-[10px] text-emerald-400 font-mono">STATUS: ONLINE</span>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">MOTOR DRIVER (L298N)</span>
            <p className="text-xs font-bold font-mono text-slate-100">{rover.motor_driver}</p>
            <div className="text-[10px] font-mono text-cyan-300 mt-0.5">
              L: <span className="font-bold text-slate-100">{rover.left_motor}</span> | R: <span className="font-bold text-slate-100">{rover.right_motor}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/30">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">MOVEMENT STATUS</span>
            <p className={`text-xs font-bold font-mono ${isEstop ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
              {rover.movement_status}
            </p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/30">
            <Wifi className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">REMOTE LINK</span>
            <p className="text-xs font-bold font-mono text-emerald-400">Wi-Fi / Bluetooth</p>
            <span className="text-[10px] text-slate-400 font-mono">STATUS: CONNECTED</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Obstacle Detection & Teleoperation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Ultrasonic Obstacle Avoidance Panel */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm font-mono">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                ULTRASONIC OBSTACLE AVOIDANCE SENSORS
              </h3>
              <span className="text-xs font-mono text-slate-400">HARDWARE READINGS</span>
            </div>

            {/* Obstacle Alert Banner if detected */}
            {sensors.obstacle_detected && (
              <div className="mb-4 p-3 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono text-xs flex items-center gap-2 animate-bounce">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>⚠️ OBSTACLE DETECTED FRONT (&lt; 20 cm) — ROVER STOPPED FOR SAFETY</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 text-center font-mono mb-6">
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">LEFT DISTANCE</span>
                <p className="text-lg font-bold text-slate-100 mt-1">{sensors.ultrasonic_left.toFixed(1)} cm</p>
              </div>

              <div className={`p-3 rounded-lg border ${
                sensors.ultrasonic_front < 20
                  ? 'bg-amber-950/60 border-amber-500/80 text-amber-300 font-bold animate-pulse'
                  : 'bg-slate-900/80 border-slate-800 text-slate-100'
              }`}>
                <span className="text-[10px] text-slate-400 block">FRONT DISTANCE</span>
                <p className="text-xl font-bold mt-1">{sensors.ultrasonic_front.toFixed(1)} cm</p>
                <span className="text-[9px] text-slate-500">Min safe: 20 cm</span>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">RIGHT DISTANCE</span>
                <p className="text-lg font-bold text-slate-100 mt-1">{sensors.ultrasonic_right.toFixed(1)} cm</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 font-mono text-xs text-slate-400">
            <span>OBSTACLE AVOIDANCE LOGIC:</span> If front distance &lt; 20 cm, the microcontroller immediately stops DC motors via L298N driver to prevent collision.
          </div>
        </div>

        {/* Rover Movement & Emergency Stop Controls */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-100 mb-1 font-mono">ROVER TELEOPERATION & EMERGENCY STOP</h3>
            <p className="text-xs text-slate-400 mb-4">Manual directional control & emergency shutdown switch</p>

            {/* Prominent Emergency Stop Switch */}
            <div className="p-4 bg-red-950/40 rounded-xl border border-red-500/60 mb-6 text-center shadow-lg">
              <span className="text-xs font-mono font-bold text-red-300 uppercase block mb-2">
                🚨 EMERGENCY STOP PUSH BUTTON
              </span>

              {isEstop ? (
                <button
                  onClick={() => toggleEStop(false)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-extrabold text-sm rounded-lg border border-emerald-400 shadow-lg transition flex items-center justify-center gap-2"
                >
                  RESET / RELEASE EMERGENCY STOP
                </button>
              ) : (
                <button
                  onClick={() => toggleEStop(true)}
                  className="w-full py-3.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-mono font-black text-sm rounded-lg border-2 border-red-300 shadow-2xl shadow-red-600/50 transition transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 animate-pulse"
                >
                  <Octagon className="w-5 h-5" />
                  EMERGENCY STOP (SHUTDOWN MOTORS)
                </button>
              )}
            </div>

            {/* Directional Controls */}
            <div className="mb-4">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-3 text-center">
                MANUAL DIRECTIONAL CONTROLS
              </span>

              <div className="grid grid-cols-3 gap-2 max-w-[210px] mx-auto">
                <div></div>
                <button
                  disabled={isEstop}
                  onClick={() => controlRover('forward')}
                  className="p-3 bg-slate-800 hover:bg-cyan-600 text-slate-100 hover:text-white rounded-lg flex items-center justify-center disabled:opacity-30 border border-slate-700 transition"
                  title="Forward"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <div></div>

                <button
                  disabled={isEstop}
                  onClick={() => controlRover('left')}
                  className="p-3 bg-slate-800 hover:bg-cyan-600 text-slate-100 hover:text-white rounded-lg flex items-center justify-center disabled:opacity-30 border border-slate-700 transition"
                  title="Turn Left"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  disabled={isEstop}
                  onClick={() => controlRover('stop')}
                  className="p-3 bg-amber-600/80 hover:bg-amber-500 text-white rounded-lg font-mono font-bold text-xs flex items-center justify-center disabled:opacity-30 border border-amber-400 transition"
                  title="Stop Rover"
                >
                  STOP
                </button>
                <button
                  disabled={isEstop}
                  onClick={() => controlRover('right')}
                  className="p-3 bg-slate-800 hover:bg-cyan-600 text-slate-100 hover:text-white rounded-lg flex items-center justify-center disabled:opacity-30 border border-slate-700 transition"
                  title="Turn Right"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div></div>
                <button
                  disabled={isEstop}
                  onClick={() => controlRover('backward')}
                  className="p-3 bg-slate-800 hover:bg-cyan-600 text-slate-100 hover:text-white rounded-lg flex items-center justify-center disabled:opacity-30 border border-slate-700 transition"
                  title="Reverse"
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
                <div></div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 text-center">
            EMERGENCY STOP OVERRIDES NORMAL ROVER MOVEMENT
          </div>
        </div>

      </div>

    </div>
  );
};
