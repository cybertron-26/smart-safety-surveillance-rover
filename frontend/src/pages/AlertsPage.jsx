import React, { useState, useEffect } from 'react';
import { Bell, AlertOctagon, CheckCircle2, Clock } from 'lucide-react';

export const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);

  const fetchAlerts = () => {
    fetch('/api/alerts')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') setAlerts(data.alerts || []);
      })
      .catch(err => console.error("Fetch alerts error:", err));
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      
      <div className="glass-card p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2 font-mono">
              <Bell className="w-5 h-5 text-cyan-400" />
              SYSTEM ALERTS & EMERGENCY NOTIFICATIONS
            </h2>
            <p className="text-xs text-slate-400">Real-time log of environmental hazard alerts, obstacle warnings & emergency stops</p>
          </div>

          <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-slate-300">
            TOTAL LOGGED ALERTS: {alerts.length}
          </span>
        </div>

        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-bold text-slate-200">NO ACTIVE HAZARD ALERTS</p>
              <p className="text-xs text-slate-500 mt-1">All MQ-2, MQ-135, and DHT readings are within safe prototype limits.</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const isDanger = alert.alert_type.startsWith('DANGER');
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isDanger
                      ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-950/40 animate-pulse'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isDanger ? 'bg-red-500 text-white' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}>
                          {alert.alert_type}
                        </span>
                        <span className="text-xs font-mono text-cyan-400 font-bold">{alert.sensor_name}</span>
                        <span className="text-xs font-mono text-slate-500">• {new Date(alert.timestamp).toLocaleTimeString()}</span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-100 mt-1.5">{alert.description}</h4>
                      
                      {alert.value !== null && alert.value !== undefined && (
                        <p className="text-xs text-slate-400 mt-1 font-mono">
                          Current Measured Value: <span className="text-red-400 font-bold">{alert.value}</span> | Configured Prototype Threshold: <span className="text-slate-200">{alert.threshold}</span>
                        </p>
                      )}
                    </div>

                    <span className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                      alert.status === 'ACTIVE' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {alert.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
