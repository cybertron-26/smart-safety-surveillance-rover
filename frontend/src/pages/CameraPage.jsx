import React, { useRef, useEffect } from 'react';
import { useSystem } from '../context/SystemContext';
import { Camera, RotateCcw, Video, Compass } from 'lucide-react';

export const CameraPage = () => {
  const { telemetry, setCameraServo } = useSystem();
  const canvasRef = useRef(null);
  const servoAngle = telemetry?.rover?.camera_servo_angle || "CENTER";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frameId;
    let tick = 0;

    const render = () => {
      tick += 1;
      const w = canvas.width;
      const h = canvas.height;

      // Dark background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      // Tunnel grid offset based on servo angle
      let angleOffset = 0;
      if (servoAngle === "LEFT") angleOffset = -60;
      if (servoAngle === "RIGHT") angleOffset = 60;

      const vpX = w / 2 + angleOffset + Math.sin(tick * 0.04) * 4;
      const vpY = h / 2 + Math.cos(tick * 0.04) * 2;

      // Draw perspective tunnel lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.lineWidth = 1;

      const corners = [[0, 0], [w, 0], [w, h], [0, h]];
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(corners[i][0], corners[i][1]);
        ctx.lineTo(vpX, vpY);
        ctx.stroke();
      }

      // Depth frames
      for (let i = 1; i <= 5; i++) {
        const offset = ((tick * 2 + i * 40) % 200) / 200;
        const rw = w * offset;
        const rh = h * offset;
        const rx = vpX - rw / 2;
        const ry = vpY - rh / 2;
        ctx.strokeStyle = `rgba(6, 182, 212, ${0.45 * (1 - offset)})`;
        ctx.strokeRect(rx, ry, rw, rh);
      }

      // HUD Crosshair
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(vpX, vpY, 22, 0, Math.PI * 2);
      ctx.moveTo(vpX - 35, vpY); ctx.lineTo(vpX - 12, vpY);
      ctx.moveTo(vpX + 12, vpY); ctx.lineTo(vpX + 35, vpY);
      ctx.moveTo(vpX, vpY - 35); ctx.lineTo(vpX, vpY - 12);
      ctx.moveTo(vpX, vpY + 12); ctx.lineTo(vpX, vpY + 35);
      ctx.stroke();

      // HUD Text
      ctx.fillStyle = '#06b6d4';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillText(`CAM-01 SURVEILLANCE [SIMULATED FEED]`, 15, 25);
      ctx.fillText(`SERVO ANGLE: ${servoAngle}`, 15, 42);

      ctx.fillStyle = '#10b981';
      ctx.fillText(`STATUS: LIVE STREAMING`, w - 180, 25);

      frameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frameId);
  }, [servoAngle]);

  return (
    <div className="space-y-6">
      
      <div className="glass-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2 font-mono">
              <Camera className="w-5 h-5 text-cyan-400" />
              LIVE CAMERA SURVEILLANCE
            </h2>
            <p className="text-xs text-slate-400">Remote visual inspection station for hazardous area monitoring</p>
          </div>

          <div className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-xs font-mono font-bold">
            ⚠️ SIMULATED CAMERA FEED
          </div>
        </div>

        {/* Camera Feed Canvas */}
        <div className="mt-6 relative rounded-xl overflow-hidden border border-cyan-500/40 bg-slate-950 shadow-2xl">
          <canvas ref={canvasRef} width={800} height={420} className="w-full h-auto block" />
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 border border-slate-700 rounded text-xs font-mono text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            SURVEILLANCE LIVE
          </div>
        </div>

        {/* Servo Motor Angle Control Box */}
        <div className="mt-6 p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">SERVO CAMERA ROTATION CONTROL</span>
            <p className="text-xs font-bold text-slate-200 mt-0.5">CURRENT SERVO DIRECTION: <span className="text-cyan-400 font-mono">{servoAngle}</span></p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCameraServo('LEFT')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition border ${
                servoAngle === 'LEFT' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              ◄ LEFT (-45°)
            </button>
            <button
              onClick={() => setCameraServo('CENTER')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition border ${
                servoAngle === 'CENTER' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              CENTER (0°)
            </button>
            <button
              onClick={() => setCameraServo('RIGHT')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition border ${
                servoAngle === 'RIGHT' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              RIGHT (+45°) ►
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
