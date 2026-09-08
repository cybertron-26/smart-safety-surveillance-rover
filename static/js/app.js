/**
 * Smart Safety Surveillance Rover - Client Application Controller
 */

let state = {
  telemetry: null,
  activeTab: "dashboard",
  servoAngle: "CENTER"
};

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initDemoControls();
  initRoverControls();
  initServoControls();
  initSSE();
  startCameraLoop();
  updateClock();
  setInterval(updateClock, 1000);
});

function initNav() {
  document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      state.activeTab = tab.dataset.tab;

      document.querySelectorAll(".page-view").forEach(v => v.classList.add("hidden"));
      const targetView = document.getElementById(`view-${state.activeTab}`);
      if (targetView) targetView.classList.remove("hidden");

      updateUI();
    });
  });
}

function initDemoControls() {
  document.querySelectorAll(".demo-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const scenario = btn.dataset.scenario;
      triggerScenario(scenario);
    });
  });

  const simSafeBtn = document.getElementById("sim-safe-btn");
  if (simSafeBtn) {
    simSafeBtn.addEventListener("click", () => triggerScenario("normal"));
  }

  const simDangerBtn = document.getElementById("sim-danger-btn");
  if (simDangerBtn) {
    simDangerBtn.addEventListener("click", () => triggerScenario("danger_gas"));
  }
}

async function triggerScenario(scenario) {
  try {
    const res = await fetch("/api/demo/scenario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario })
    });
    const data = await res.json();
    if (data.status === "success") {
      document.querySelectorAll(".demo-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.scenario === scenario);
      });
      const tag = document.getElementById("active-scenario-name");
      if (tag) tag.innerText = scenario.toUpperCase();
    }
  } catch (err) {
    console.error("Scenario trigger error:", err);
  }
}

function initRoverControls() {
  document.querySelectorAll(".dpad-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const cmd = btn.dataset.cmd;
      if (cmd) {
        await fetch("/api/rover/control", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: cmd })
        });
      }
    });
  });

  const estopBtn = document.getElementById("main-estop-btn");
  if (estopBtn) {
    estopBtn.addEventListener("click", async () => {
      const isEstop = state.telemetry?.rover?.estop_active;
      await fetch("/api/rover/estop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !isEstop })
      });
    });
  }

  const bannerEstopBtn = document.getElementById("banner-estop-btn");
  if (bannerEstopBtn) {
    bannerEstopBtn.addEventListener("click", async () => {
      await fetch("/api/rover/estop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: true })
      });
    });
  }
}

function initServoControls() {
  document.querySelectorAll(".servo-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const angle = btn.dataset.angle;
      try {
        const res = await fetch("/api/rover/servo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ angle })
        });
        const data = await res.json();
        if (data.status === "success") {
          state.servoAngle = angle;
          document.querySelectorAll(".servo-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          const lbl = document.getElementById("servo-current-angle");
          if (lbl) lbl.innerText = `SERVO ANGLE: ${angle}`;
        }
      } catch (e) {
        console.error("Servo angle error:", e);
      }
    });
  });
}

function initSSE() {
  const eventSource = new EventSource("/api/telemetry/stream");

  eventSource.onopen = () => {
    document.getElementById("conn-badge").className = "badge-conn online";
    document.getElementById("conn-badge").innerText = "● CONNECTED (Wi-Fi/BT)";
    document.getElementById("disconnected-card").classList.add("hidden");
  };

  eventSource.onmessage = (event) => {
    try {
      state.telemetry = JSON.parse(event.data);
      updateUI();
    } catch (e) {
      console.error("SSE parse error:", e);
    }
  };

  eventSource.onerror = () => {
    document.getElementById("conn-badge").className = "badge-conn offline";
    document.getElementById("conn-badge").innerText = "● DISCONNECTED";
    document.getElementById("disconnected-card").classList.remove("hidden");
  };
}

function updateUI() {
  if (!state.telemetry) return;
  const t = state.telemetry;
  const isDanger = t.system_status === "DANGER";
  const isEstop = t.rover?.estop_active;
  const hw = t.hardware_indicators || {};
  const s = t.sensors || {};

  // Header Status
  const statusTxt = document.getElementById("system-status-text");
  if (statusTxt) {
    statusTxt.innerText = t.system_status || "SAFE";
    statusTxt.className = isDanger ? "text-danger" : "text-safe";
  }

  const estopBadge = document.getElementById("estop-badge");
  if (estopBadge) {
    if (isEstop) estopBadge.classList.remove("hidden");
    else estopBadge.classList.add("hidden");
  }

  // Global Advisory Banner
  const banner = document.getElementById("emergency-banner");
  if (banner) {
    banner.className = isDanger ? "emergency-banner danger-banner" : "emergency-banner safe-banner";
    const siren = document.getElementById("banner-siren-icon");
    if (siren) siren.innerText = isDanger ? "🚨" : "🟢";

    const bTitle = document.getElementById("banner-title-text");
    if (bTitle) bTitle.innerText = t.display_text || (isDanger ? "DANGER – EVACUATE" : "AREA SAFE – WORKERS CAN ENTER");

    const bMsg = document.getElementById("banner-msg-text");
    if (bMsg) {
      bMsg.innerText = isDanger
        ? (t.triggers?.[0]?.message || "Environmental hazard reading exceeds safety threshold! Workers must evacuate!")
        : "Rover inspection completed. All environmental metrics nominal. Workers can enter.";
    }
  }

  // Nav alert badge
  const alertBadge = document.getElementById("alert-count-badge");
  if (alertBadge) alertBadge.innerText = t.active_alerts_count || 0;

  // View 1: Dashboard updates
  if (state.activeTab === "dashboard") {
    const dashGrid = document.getElementById("dash-sensors-grid");
    if (dashGrid) dashGrid.innerHTML = renderDashboardSensorsGrid(t);

    const dStatus = document.getElementById("dash-system-status");
    if (dStatus) { dStatus.innerText = t.system_status; dStatus.className = isDanger ? "text-danger" : "text-safe"; }

    const dRover = document.getElementById("dash-rover-status");
    if (dRover) dRover.innerText = t.rover?.movement_status || "PATROLLING";

    const dOpMode = document.getElementById("dash-op-mode");
    if (dOpMode) { dOpMode.innerText = `${t.system_status} MODE`; dOpMode.className = isDanger ? "text-danger font-bold" : "text-safe font-bold"; }

    // LEDs & Buzzer
    document.getElementById("led-green-val").innerText = hw.green_led || "ON";
    document.getElementById("led-green-circle").className = hw.green_led === "ON" ? "led-circle green on" : "led-circle green";

    document.getElementById("led-red-val").innerText = hw.red_led || "OFF";
    document.getElementById("led-red-circle").className = hw.red_led === "ON" ? "led-circle red on" : "led-circle red";

    document.getElementById("led-buzzer-val").innerText = hw.buzzer || "OFF";
    document.getElementById("led-buzzer-circle").className = hw.buzzer === "ON" ? "led-circle buzzer on" : "led-circle buzzer";

    // LCD display widget
    const lcdWidget = document.getElementById("lcd-screen-widget");
    if (lcdWidget) lcdWidget.className = isDanger ? "lcd-widget danger" : "lcd-widget safe";

    if (hw.lcd_display) {
      document.getElementById("lcd-line1").innerText = `[ ${hw.lcd_display.line1} ]`;
      document.getElementById("lcd-line2").innerText = `[ ${hw.lcd_display.line2} ]`;
      document.getElementById("lcd-line3").innerText = `[ ${hw.lcd_display.line3} ]`;
    }
  }

  // View 2: Rover Monitoring updates
  else if (state.activeTab === "rover") {
    document.getElementById("us-left-val").innerText = `${(s.ultrasonic_left || 140).toFixed(1)} cm`;
    document.getElementById("us-front-val").innerText = `${(s.ultrasonic_front || 120).toFixed(1)} cm`;
    document.getElementById("us-right-val").innerText = `${(s.ultrasonic_right || 130).toFixed(1)} cm`;

    const obsBanner = document.getElementById("obstacle-alert-banner");
    const frontBox = document.getElementById("us-front-box");
    if (s.obstacle_detected || (s.ultrasonic_front < 20)) {
      if (obsBanner) obsBanner.classList.remove("hidden");
      if (frontBox) frontBox.className = "us-box highlight danger";
    } else {
      if (obsBanner) obsBanner.classList.add("hidden");
      if (frontBox) frontBox.className = "us-box highlight";
    }

    const l298n = document.getElementById("l298n-status-txt");
    if (l298n) l298n.innerText = `L: ${t.rover?.left_motor || "FORWARD"} | R: ${t.rover?.right_motor || "FORWARD"}`;
  }

  // View 3: Environmental Monitoring updates
  else if (state.activeTab === "environmental") {
    const envGrid = document.getElementById("env-sensors-grid");
    if (envGrid) envGrid.innerHTML = renderDashboardSensorsGrid(t);
  }

  // View 7: System Info updates
  else if (state.activeTab === "info") {
    const hwGrid = document.getElementById("hw-info-grid");
    if (hwGrid && !hwGrid.dataset.rendered) {
      hwGrid.innerHTML = renderHardwareInfoGrid();
      hwGrid.dataset.rendered = "true";
    }
  }
}

function startCameraLoop() {
  let tick = 0;
  function loop() {
    tick++;
    drawSimulatedCamera(tick);
    requestAnimationFrame(loop);
  }
  loop();
}

function drawSimulatedCamera(tick) {
  const canvas = document.getElementById("camera-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, w, h);

  let angleOffset = 0;
  if (state.servoAngle === "LEFT") angleOffset = -80;
  if (state.servoAngle === "RIGHT") angleOffset = 80;

  const vpX = w / 2 + angleOffset + Math.sin(tick * 0.04) * 4;
  const vpY = h / 2 + Math.cos(tick * 0.04) * 2;

  ctx.strokeStyle = "rgba(6, 182, 212, 0.35)";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(vpX, vpY);
  ctx.moveTo(w, 0); ctx.lineTo(vpX, vpY);
  ctx.moveTo(w, h); ctx.lineTo(vpX, vpY);
  ctx.moveTo(0, h); ctx.lineTo(vpX, vpY);
  ctx.stroke();

  for (let i = 1; i <= 5; i++) {
    const offset = ((tick * 2 + i * 40) % 200) / 200;
    const rw = w * offset;
    const rh = h * offset;
    const rx = vpX - rw / 2;
    const ry = vpY - rh / 2;
    ctx.strokeStyle = `rgba(6, 182, 212, ${0.45 * (1 - offset)})`;
    ctx.strokeRect(rx, ry, rw, rh);
  }

  // Crosshair
  ctx.strokeStyle = "#06b6d4";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(vpX, vpY, 20, 0, Math.PI * 2);
  ctx.moveTo(vpX - 30, vpY); ctx.lineTo(vpX - 10, vpY);
  ctx.moveTo(vpX + 10, vpY); ctx.lineTo(vpX + 30, vpY);
  ctx.moveTo(vpX, vpY - 30); ctx.lineTo(vpX, vpY - 10);
  ctx.moveTo(vpX, vpY + 10); ctx.lineTo(vpX, vpY + 30);
  ctx.stroke();

  ctx.fillStyle = "#06b6d4";
  ctx.font = "12px 'JetBrains Mono', monospace";
  ctx.fillText("CAM-01 SURVEILLANCE FEED [SIMULATED]", 15, 25);
  ctx.fillText(`SERVO CAMERA ANGLE: ${state.servoAngle}`, 15, 42);
}

function updateClock() {
  const clock = document.getElementById("clock-txt");
  if (clock) clock.innerText = new Date().toLocaleTimeString();
}
