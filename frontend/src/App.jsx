import React, { useState } from 'react';
import { SystemProvider, useSystem } from './context/SystemContext';
import { Navbar } from './components/Navbar';
import { Navigation } from './components/Navigation';
import { EmergencyBanner } from './components/EmergencyBanner';
import { DemoControls } from './components/DemoControls';

import { Dashboard } from './pages/Dashboard';
import { RoverPage } from './pages/RoverPage';
import { EnvironmentalPage } from './pages/EnvironmentalPage';
import { CameraPage } from './pages/CameraPage';
import { AlertsPage } from './pages/AlertsPage';
import { SimulationPage } from './pages/SimulationPage';
import { SystemInfoPage } from './pages/SystemInfoPage';

import { Activity, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

const MainContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { connected, loading, error, refreshData } = useSystem();

  return (
    <div className="app-container">
      <Navbar />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <EmergencyBanner />

      <main className="main-content">
        <DemoControls />

        {/* Disconnected Connection Warning State */}
        {!connected && !loading && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 flex items-center justify-between shadow-xl animate-pulse">
            <div className="flex items-center gap-3">
              <WifiOff className="w-6 h-6 text-red-400" />
              <div>
                <h4 className="font-mono font-bold text-sm">REMOTE MONITORING LINK LOST</h4>
                <p className="text-xs text-red-300">Attempting automatic reconnect to Arduino/ESP32 server...</p>
              </div>
            </div>
            <button
              onClick={refreshData}
              className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white font-mono text-xs font-bold rounded-lg border border-red-400 flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> RETRY NOW
            </button>
          </div>
        )}

        {/* Initial Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="p-4 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-radar">
              <Activity className="w-12 h-12" />
            </div>
            <p className="font-mono text-sm text-cyan-300 animate-pulse">
              CONNECTING TO SURVEILLANCE ROVER TELEMETRY STATION...
            </p>
          </div>
        ) : error && !connected ? (
          /* Error State */
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center glass-card p-8">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <h3 className="font-bold text-lg text-slate-100">UNABLE TO CONNECT TO MONITORING STATION</h3>
            <p className="text-xs text-slate-400 max-w-md">{error}</p>
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold rounded-lg transition"
            >
              RECONNECT STATION
            </button>
          </div>
        ) : (
          /* 7 Main Navigation Tab Router */
          <>
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'rover' && <RoverPage />}
            {activeTab === 'environmental' && <EnvironmentalPage />}
            {activeTab === 'camera' && <CameraPage />}
            {activeTab === 'alerts' && <AlertsPage />}
            {activeTab === 'simulation' && <SimulationPage />}
            {activeTab === 'info' && <SystemInfoPage />}
          </>
        )}
      </main>

      <footer className="border-t border-slate-800 py-3 text-center text-xs font-mono text-slate-500 bg-slate-950">
        Smart Safety Surveillance Rover • Industrial & Mining Hazardous Environment Command Station
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <SystemProvider>
      <MainContent />
    </SystemProvider>
  );
}
