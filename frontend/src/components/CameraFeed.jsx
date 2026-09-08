import React, { useRef, useEffect } from 'react';

export const CameraFeed = ({ rover }) => {
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

      // Dark background
      ctx.fillStyle = '#050c18';
      ctx.fillRect(0, 0, w, h);

      // Simulated tunnel perspective grid lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 1;

      // Center vanishing point
      const vpX = w / 2 + Math.sin(tick * 0.05) * 5;
      const vpY = h / 2 + Math.cos(tick * 0.05) * 3;

      // Draw perspective tunnel lines
      const corners = [
        [0, 0], [w, 0], [w, h], [0, h],
        [w * 0.2, h * 0.2], [w * 0.8, h * 0.2], [w * 0.8, h * 0.8], [w * 0.2, h * 0.8]
      ];

      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(corners[i][0], corners[i][1]);
        ctx.lineTo(vpX, vpY);
        ctx.stroke();
      }

      // Moving depth rectangles
      for (let i = 1; i <= 5; i++) {
        const offset = ((tick * 2 + i * 40) % 200) / 200;
        const rw = w * offset;
        const rh = h * offset;
        const rx = vpX - rw / 2;
        const ry = vpY - rh / 2;
        ctx.strokeStyle = `rgba(6, 182, 212, ${0.4 * (1 - offset)})`;
        ctx.strokeRect(rx, ry, rw, rh);
      }

      // HUD Crosshair
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(vpX, vpY, 20, 0, Math.PI * 2);
      ctx.moveTo(vpX - 30, vpY); ctx.lineTo(vpX - 10, vpY);
      ctx.moveTo(vpX + 10, vpY); ctx.lineTo(vpX + 30, vpY);
      ctx.moveTo(vpX, vpY - 30); ctx.lineTo(vpX, vpY - 10);
      ctx.moveTo(vpX, vpY + 10); ctx.lineTo(vpX, vpY + 30);
      ctx.stroke();

      // HUD Text Overlays
      ctx.fillStyle = '#06b6d4';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`CAM-01 [OPTICAL HUD]`, 15, 25);
      ctx.fillText(`FPS: 30.0 | RES: 1080p`, 15, 42);
      ctx.fillText(`BAT: ${rover?.battery?.toFixed(1) || 88.5}%`, 15, h - 20);

      ctx.fillStyle = '#10b981';
      ctx.fillText(`MODE: ${rover?.status || 'PATROL'}`, w - 160, 25);
      ctx.fillText(`ZONE: ${rover?.zone_id || 'ZONE 1'}`, w - 160, 42);

      frameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frameId);
  }, [rover]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-cyan-500/30 bg-slate-950 shadow-inner">
      <canvas ref={canvasRef} width={480} height={270} className="w-full h-auto block" />
      <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-0.5 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-mono text-cyan-400">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
        LIVE FEED
      </div>
    </div>
  );
};
