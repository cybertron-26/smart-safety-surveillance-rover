import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SystemContext = createContext(null);

export const SystemProvider = ({ children }) => {
  const [telemetry, setTelemetry] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const fetchInitialData = useCallback(async () => {
    try {
      const res = await fetch('/api/system/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTelemetry(data);
      setConnected(true);
      setError(null);
    } catch (err) {
      console.error("Fetch telemetry error:", err);
      setConnected(false);
      setError("Failed to connect to Surveillance Station Backend");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();

    // Setup SSE real-time stream
    const eventSource = new EventSource('/api/telemetry/stream');

    eventSource.onopen = () => {
      setConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setTelemetry(data);
        setConnected(true);
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn("SSE Connection lost, retrying fallback poll...", err);
      setConnected(false);
    };

    const interval = setInterval(fetchInitialData, 2000);

    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, [fetchInitialData]);

  // Actions
  const triggerDemoScenario = async (scenario) => {
    try {
      const res = await fetch('/api/demo/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchInitialData();
      }
      return data;
    } catch (err) {
      return { status: 'error', message: err.message };
    }
  };

  const controlRover = async (command) => {
    try {
      const res = await fetch('/api/rover/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      const data = await res.json();
      fetchInitialData();
      return data;
    } catch (err) {
      return { status: 'error', message: err.message };
    }
  };

  const setCameraServo = async (angle) => {
    try {
      const res = await fetch('/api/rover/servo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ angle })
      });
      const data = await res.json();
      fetchInitialData();
      return data;
    } catch (err) {
      return { status: 'error', message: err.message };
    }
  };

  const toggleEStop = async (active) => {
    try {
      const res = await fetch('/api/rover/estop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active })
      });
      const data = await res.json();
      fetchInitialData();
      return data;
    } catch (err) {
      return { status: 'error', message: err.message };
    }
  };

  return (
    <SystemContext.Provider value={{
      telemetry,
      connected,
      loading,
      error,
      soundEnabled,
      setSoundEnabled,
      triggerDemoScenario,
      controlRover,
      setCameraServo,
      toggleEStop,
      refreshData: fetchInitialData
    }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) throw new Error("useSystem must be used within a SystemProvider");
  return context;
};
