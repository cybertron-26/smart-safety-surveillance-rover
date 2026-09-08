import React from 'react';

export const RiskGauge = ({ score = 0, classification = 'SAFE', confidence = 95 }) => {
  const radius = 70;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Arc 75% circle (270 degrees)
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (score / 100) * arcLength;

  const getColor = () => {
    if (score >= 70) return '#ef4444'; // Red
    if (score >= 35) return '#f59e0b'; // Amber
    return '#10b981'; // Green
  };

  return (
    <div className="flex flex-col items-center justify-center relative p-4">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-135">
        {/* Background Track Arc */}
        <circle
          stroke="rgba(255, 255, 255, 0.08)"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${arcLength} ${circumference}`}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeLinecap="round"
        />
        {/* Dynamic Progress Arc */}
        <circle
          stroke={getColor()}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${arcLength} ${circumference}`}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.5s ease' }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute flex flex-col items-center justify-center text-center mt-2">
        <span className="text-3xl font-extrabold font-mono tracking-tight text-slate-100">
          {score.toFixed(1)}
        </span>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
          AI RISK SCORE
        </span>
        <span className="text-[11px] font-mono text-cyan-400 mt-1">
          {confidence}% CONFIDENCE
        </span>
      </div>
    </div>
  );
};
