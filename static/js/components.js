/**
 * Component Renderers for Smart Safety Surveillance Rover System
 */

// 1. Dashboard Environmental Sensor Cards Renderer
function renderDashboardSensorsGrid(telemetry) {
  const s = telemetry?.sensors || { mq2_smoke_gas: 120.0, mq135_toxic_gas: 150.0, temperature: 29.0, humidity: 60.0 };
  const t = telemetry?.thresholds || { mq2_smoke_gas: { danger: 400.0 }, mq135_toxic_gas: { danger: 500.0 }, temperature: { danger: 40.0 }, humidity: { danger: 80.0 } };

  return `
    <div class="glass-card" style="border-color:${s.mq2_smoke_gas > t.mq2_smoke_gas.danger ? '#ef4444' : '#1e293b'}">
      <div style="display:flex; justify-content:space-between; font-family:monospace; font-size:0.75rem; color:#94a3b8; margin-bottom:8px;">
        <span>MQ-2 SMOKE / GAS</span>
        <span style="color:#f59e0b;">🔥</span>
      </div>
      <div style="font-size:1.6rem; font-weight:bold; font-family:monospace; color:${s.mq2_smoke_gas > t.mq2_smoke_gas.danger ? '#ef4444' : '#f1f5f9'};">
        ${s.mq2_smoke_gas.toFixed(1)} <span style="font-size:0.75rem; color:#64748b;">ppm</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-family:monospace; font-size:0.65rem; border-top:1px solid #1e293b; padding-top:6px; margin-top:8px;">
        <span style="color:#64748b;">Threshold: ${t.mq2_smoke_gas.danger} ppm</span>
        <strong style="color:${s.mq2_smoke_gas > t.mq2_smoke_gas.danger ? '#ef4444' : '#10b981'};">${s.mq2_smoke_gas > t.mq2_smoke_gas.danger ? 'DANGER' : 'NORMAL'}</strong>
      </div>
    </div>

    <div class="glass-card" style="border-color:${s.mq135_toxic_gas > t.mq135_toxic_gas.danger ? '#ef4444' : '#1e293b'}">
      <div style="display:flex; justify-content:space-between; font-family:monospace; font-size:0.75rem; color:#94a3b8; margin-bottom:8px;">
        <span>MQ-135 TOXIC GAS</span>
        <span style="color:#a855f7;">☣️</span>
      </div>
      <div style="font-size:1.6rem; font-weight:bold; font-family:monospace; color:${s.mq135_toxic_gas > t.mq135_toxic_gas.danger ? '#ef4444' : '#f1f5f9'};">
        ${s.mq135_toxic_gas.toFixed(1)} <span style="font-size:0.75rem; color:#64748b;">ppm</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-family:monospace; font-size:0.65rem; border-top:1px solid #1e293b; padding-top:6px; margin-top:8px;">
        <span style="color:#64748b;">Threshold: ${t.mq135_toxic_gas.danger} ppm</span>
        <strong style="color:${s.mq135_toxic_gas > t.mq135_toxic_gas.danger ? '#ef4444' : '#10b981'};">${s.mq135_toxic_gas > t.mq135_toxic_gas.danger ? 'DANGER' : 'NORMAL'}</strong>
      </div>
    </div>

    <div class="glass-card" style="border-color:${s.temperature > t.temperature.danger ? '#ef4444' : '#1e293b'}">
      <div style="display:flex; justify-content:space-between; font-family:monospace; font-size:0.75rem; color:#94a3b8; margin-bottom:8px;">
        <span>DHT TEMPERATURE</span>
        <span style="color:#ef4444;">🌡️</span>
      </div>
      <div style="font-size:1.6rem; font-weight:bold; font-family:monospace; color:${s.temperature > t.temperature.danger ? '#ef4444' : '#f1f5f9'};">
        ${s.temperature.toFixed(1)} <span style="font-size:0.75rem; color:#64748b;">°C</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-family:monospace; font-size:0.65rem; border-top:1px solid #1e293b; padding-top:6px; margin-top:8px;">
        <span style="color:#64748b;">Threshold: ${t.temperature.danger} °C</span>
        <strong style="color:${s.temperature > t.temperature.danger ? '#ef4444' : '#10b981'};">${s.temperature > t.temperature.danger ? 'DANGER' : 'NORMAL'}</strong>
      </div>
    </div>

    <div class="glass-card" style="border-color:${s.humidity > t.humidity.danger ? '#ef4444' : '#1e293b'}">
      <div style="display:flex; justify-content:space-between; font-family:monospace; font-size:0.75rem; color:#94a3b8; margin-bottom:8px;">
        <span>DHT HUMIDITY</span>
        <span style="color:#38bdf8;">💧</span>
      </div>
      <div style="font-size:1.6rem; font-weight:bold; font-family:monospace; color:${s.humidity > t.humidity.danger ? '#ef4444' : '#f1f5f9'};">
        ${s.humidity.toFixed(1)} <span style="font-size:0.75rem; color:#64748b;">%</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-family:monospace; font-size:0.65rem; border-top:1px solid #1e293b; padding-top:6px; margin-top:8px;">
        <span style="color:#64748b;">Threshold: ${t.humidity.danger}%</span>
        <strong style="color:${s.humidity > t.humidity.danger ? '#ef4444' : '#10b981'};">${s.humidity > t.humidity.danger ? 'DANGER' : 'NORMAL'}</strong>
      </div>
    </div>
  `;
}

// 2. Hardware Information 15 Component Grid Renderer
function renderHardwareInfoGrid() {
  const hw = [
    { num: 1, name: "Arduino Uno / ESP32", role: "Main Microcontroller Board", desc: "Executes sensor reading, threshold comparison, LED/buzzer signals, and remote wireless transmission." },
    { num: 2, name: "MQ-2 Gas Sensor", role: "Smoke & Flammable Gas Detection", desc: "Measures combustible gas and smoke levels (ppm). Triggers DANGER mode if level > 400 ppm." },
    { num: 3, name: "MQ-135 Gas Sensor", role: "Harmful & Toxic Gas Detection", desc: "Measures toxic gas concentrations (CO, ppm). Triggers DANGER mode if level > 500 ppm." },
    { num: 4, name: "DHT11 / DHT22 Sensor", role: "Temperature & Humidity Measurement", desc: "Measures ambient temperature (°C) and humidity (%). Triggers DANGER mode if temp > 40°C or hum > 80%." },
    { num: 5, name: "Ultrasonic Sensors", role: "Obstacle Distance Detection", desc: "Measures front, left, and right obstacle distances (cm). Automatically stops DC motors if obstacle < 20 cm." },
    { num: 6, name: "Camera Module", role: "Live Visual Surveillance", desc: "Provides continuous live camera feed of hazardous area to remote monitoring station." },
    { num: 7, name: "Servo Motor", role: "Camera Angle Rotation", desc: "Rotates camera angle (LEFT -45°, CENTER 0°, RIGHT +45°) for wide-angle area inspection." },
    { num: 8, name: "L298N Motor Driver", role: "Dual H-Bridge Motor Driver", desc: "Controls speed and direction (Forward, Reverse, Left, Right, Stop) of two DC propulsion motors." },
    { num: 9, name: "DC Motors (x2)", role: "Rover Propulsion & Movement", desc: "Drives left and right wheels for remote teleoperation and area surveillance patrol." },
    { num: 10, name: "Buzzer", role: "Emergency Audible Alarm", desc: "Sounds loud audible alarm during DANGER MODE. OFF during SAFE MODE." },
    { num: 11, name: "Red LED", role: "Danger Mode Visual Indicator", desc: "Illuminates RED during DANGER MODE (Evacuate). OFF during SAFE MODE." },
    { num: 12, name: "Green LED", role: "Safe Mode Visual Indicator", desc: "Illuminates GREEN during SAFE MODE (Area Safe - Workers Can Enter). OFF during DANGER MODE." },
    { num: 13, name: "LCD / OLED Display", role: "Local Status & Environment Display", desc: "Displays real-time status banner ('AREA SAFE – WORKERS CAN ENTER' or 'DANGER – EVACUATE')." },
    { num: 14, name: "Emergency Stop Push Button", role: "Hardware Emergency Shutdown", purpose: "Physical red push button. When pressed, immediately trips motor driver to freeze left/right DC motors." },
    { num: 15, name: "Wi-Fi / Bluetooth Module", role: "Remote Monitoring Station Link", desc: "Transmits real-time sensor metrics and video feed wirelessly to remote monitoring station." }
  ];

  return hw.map(h => `
    <div class="hw-card">
      <div style="margin-bottom:6px;"><span class="hw-num">${h.num}</span> <strong style="font-family:monospace; font-size:0.85rem; color:#f1f5f9;">${h.name}</strong></div>
      <div style="font-size:0.7rem; font-family:monospace; color:#38bdf8; font-weight:bold; margin-bottom:6px;">${h.role}</div>
      <p style="font-size:0.75rem; color:#94a3b8; line-height:1.4;">${h.desc || h.purpose}</p>
    </div>
  `).join('');
}
