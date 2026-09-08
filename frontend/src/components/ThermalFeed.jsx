import React, { useRef, useEffect } from 'react';

export const ThermalFeed = ({ rover, maxTemp = 32.5 }) => {
  const canvasRef = useRef(null);

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

      // Thermal ironbow background gradient
      const grad = ctx.createRadialGradient(w/2, h/2, 10, w/2, h/2, w/1.5);
      grad.addColorStop(0, '#ffffff'); // Hottest spot
      grad.addColorStop(0.2, '#ef4444'); // Red
      grad.addColorStop(0.5, '#f59e0b'); // Orange
      grad.addColorStop(0.8, '#3b82f6'); // Blue
      grad.addColorStop(1, '#090d16');   // Cold background

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Simulated hotspot anomaly circle moving
      const spotX = w / 2 + Math.sin(tick * 0.03) * 60;
      const spotY = h / 2 + Math.cos(tick * 0.03) * 30;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(spotX, spotY, 15, 0, Math.PI * 2);
      ctx.fill();

      // Thermal crosshair ring on hotspot
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(spotX, spotY, 25, 0, Math.PI * 2);
      ctx.stroke();

      // HUD Text
      ctx.fillStyle = '#f59e0b';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`FLIR THERMAL IR [IRONBOW]`, 15, 25);
      ctx.fillText(`MAX SPOT TEMP: ${maxTemp.toFixed(1)}°C`, 15, 42);
      ctx.fillText(`EMISSIVITY: 0.95`, 15, h - 20);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(`SP-01: ${(maxTemp + 4.2).toFixed(1)}°C`, spotX + 30, spotY + 4);

      frameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frameId);
  }, [rover, maxTemp]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-amber-500/30 bg-slate-950 shadow-inner">
      <canvas ref={canvasRef} width={480} height={270} className="w-full h-auto block" />
      <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-0.5 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-mono text-amber-400">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
        THERMAL SCAN
      </div>
    </div>
  );
};
