import React from 'react';
import { useSystem } from '../context/SystemContext';
import { LayoutDashboard, Bot, Thermometer, Camera, Bell, Play, Info } from 'lucide-react';

export const Navigation = ({ activeTab, setActiveTab }) => {
  const { telemetry } = useSystem();
  const alertCount = telemetry?.active_alerts_count || 0;
  const isDanger = telemetry?.system_status === "DANGER";

  const tabs = [
    { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
    { id: 'rover', label: '2. Rover Monitoring', icon: Bot },
    { id: 'environmental', label: '3. Environmental Monitoring', icon: Thermometer },
    { id: 'camera', label: '4. Camera Surveillance', icon: Camera },
    { id: 'alerts', label: '5. Alerts', icon: Bell, badgeCount: alertCount },
    { id: 'simulation', label: '6. Simulation', icon: Play },
    { id: 'info', label: '7. System Information', icon: Info },
  ];

  return (
    <nav className="bg-slate-900/80 border-b border-slate-800 px-4 py-2 sticky top-[61px] z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-1.5 scrollbar-none py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-lg shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>

              {tab.badgeCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-red-500 text-white animate-pulse">
                  {tab.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
