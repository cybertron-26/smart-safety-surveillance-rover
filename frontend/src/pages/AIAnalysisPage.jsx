import React from 'react';
import { useSystem } from '../context/SystemContext';
import { RiskGauge } from '../components/RiskGauge';
import { StatusBadge } from '../components/StatusBadge';
import { BrainCircuit, ShieldAlert, Cpu, Sparkles, AlertOctagon, TrendingUp, CheckCircle, Info } from 'lucide-react';

export const AIAnalysisPage = () => {
  const { telemetry } = useSystem();
  const ai = telemetry?.ai_analysis || {
    risk_score: 18.5,
    classification: "SAFE",
    confidence: 96.4,
    most_hazardous_zone: "Zone 1",
    contributing_factors: [
      { name: "Methane (CH4) Gas", percentage: 38.2, key: "methane" },
      { name: "Carbon Monoxide (CO)", percentage: 24.1, key: "carbon_monoxide" },
      { name: "Oxygen (O2) Depletion", percentage: 15.4, key: "oxygen" },
      { name: "Thermal Gradient", percentage: 12.3, key: "temperature" },
      { name: "Structural Vibration", percentage: 10.0, key: "vibration" }
    ],
    recommendations: [
      "All subterranean environmental parameters are within safe operational limits.",
      "Autonomous Patrol: Continuing routine patrol loop across Zones 1 through 6.",
      "System Health: Sensor telemetry network operating nominal at 100% signal strength."
    ],
    is_hard_override: false,
    hard_rule_breaches: []
  };

  return (
    <div className="space-y-6">
      
      {/* Explicit Distinction Banner: AI Analysis vs Hard Safety Rules */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/40 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
              🤖 AI PREDICTIVE FUSION ENGINE vs 🛡️ DETERMINISTIC HARD SAFETY RULES
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              The AI Engine uses multi-sensor neural weights to predict risk trends and complex multi-hazard escalation. 
              <strong className="text-cyan-400"> Deterministic Hard Safety Rules (MSHA/OSHA)</strong> independently monitor strict individual gas thresholds (e.g. CH₄ &gt; 1.5%, CO &gt; 50 ppm, O₂ &lt; 19.5%). Breaching any Hard Rule triggers an <span className="text-red-400 font-bold">INSTANT EMERGENCY OVERRIDE</span> regardless of AI model confidence.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Card: AI Risk Score & Classification */}
        <div className="glass-card p-6 flex flex-col items-center justify-between border-t-4 border-t-cyan-500">
          <div className="text-center w-full mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono mb-3">
              <BrainCircuit className="w-4 h-4" />
              NEURAL SENSOR FUSION ENGINE
            </div>
            <h3 className="text-xl font-bold text-slate-100">SUBTERRANEAN RISK INDEX</h3>
            <p className="text-xs text-slate-400">Aggregated multi-hazard environmental score</p>
          </div>

          <RiskGauge score={ai.risk_score} classification={ai.classification} confidence={ai.confidence} />

          <div className="w-full mt-4 p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-center space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">CLASSIFICATION:</span>
              <StatusBadge status={ai.classification} />
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">HIGHEST RISK ZONE:</span>
              <span className="text-cyan-400 font-bold">{ai.most_hazardous_zone}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">HARD RULES STATUS:</span>
              <span className={ai.is_hard_override ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                {ai.is_hard_override ? "RULE BREACHED" : "NOMINAL"}
              </span>
            </div>
          </div>
        </div>

        {/* Center Card: Contributing Factors Breakdown */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              RISK CONTRIBUTING FACTORS
            </h3>
            <span className="text-xs font-mono text-slate-400">% INFLUENCE</span>
          </div>

          <div className="space-y-4">
            {ai.contributing_factors.map((factor, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-medium">{factor.name}</span>
                  <span className="text-cyan-400 font-bold">{factor.percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      factor.percentage > 40 ? 'bg-red-500' :
                      factor.percentage > 20 ? 'bg-amber-400' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${factor.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Hard Safety Rules Breaches List if any */}
          {ai.hard_rule_breaches && ai.hard_rule_breaches.length > 0 && (
            <div className="mt-6 p-4 rounded-xl bg-red-950/40 border border-red-500/50 space-y-2">
              <h4 className="text-xs font-mono font-bold text-red-300 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-400" />
                HARD SAFETY RULE BREACHES DETECTED
              </h4>
              {ai.hard_rule_breaches.map((b, i) => (
                <div key={i} className="text-xs text-red-200 p-2 bg-red-900/40 rounded border border-red-800">
                  <p className="font-bold font-mono">[{b.severity}] {b.rule} in {b.zone_id}</p>
                  <p className="text-[11px] mt-0.5">{b.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Card: AI Step-by-Step Recommendations */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                ACTIONABLE SAFETY RECOMMENDATIONS
              </h3>
              <span className="text-xs font-mono text-emerald-400">LIVE FEED</span>
            </div>

            <div className="space-y-3">
              {ai.recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">MODEL ARCHITECTURE</span>
            <p className="text-xs font-mono text-cyan-400 mt-0.5">RandomForest + Recurrent LSTM Fusion Engine</p>
          </div>
        </div>

      </div>

    </div>
  );
};
