"""
Main Flask REST API & Telemetry Server for Smart Safety Surveillance Rover.
"""

import json
import time
import os
from flask import Flask, jsonify, request, Response, send_from_directory
from backend.config import SAFETY_THRESHOLDS, ROVER_CONFIG, HARDWARE_INVENTORY, PROJECT_ROOT
from backend.database import init_db, get_alerts, get_sensor_history
from backend.simulator import RoverSimulator
from backend.ai_pipeline import SafetyLogicEngine

# Initialize Flask App
app = Flask(__name__, static_folder=os.path.join(PROJECT_ROOT, "static"))

# Initialize Database and Background Simulator
init_db()
simulator = RoverSimulator()
simulator.start()
safety_engine = SafetyLogicEngine()

# ----------------------------------------------------
# Static SPA Frontend Routes
# ----------------------------------------------------
@app.route("/")
def serve_index():
    static_dir = os.path.join(PROJECT_ROOT, "static")
    return send_from_directory(static_dir, "index.html")

@app.route("/<path:path>")
def serve_static_assets(path):
    static_dir = os.path.join(PROJECT_ROOT, "static")
    if os.path.exists(os.path.join(static_dir, path)):
        return send_from_directory(static_dir, path)
    return send_from_directory(static_dir, "index.html")

# ----------------------------------------------------
# REST API Endpoints
# ----------------------------------------------------
@app.route("/api/system/status", methods=["GET"])
@app.route("/api/telemetry/current", methods=["GET"])
def get_system_status():
    sim_state = simulator.get_state()
    eval_result = safety_engine.evaluate(
        sim_state["sensors"],
        sim_state["rover"]["estop_active"]
    )
    active_alerts = get_alerts(status_filter="ACTIVE", limit=50)

    return jsonify({
        "timestamp": time.time(),
        "scenario": sim_state["scenario"],
        "system_status": eval_result["status"],
        "display_text": eval_result["display_text"],
        "hardware_indicators": {
            "green_led": eval_result["green_led"],
            "red_led": eval_result["red_led"],
            "buzzer": eval_result["buzzer"],
            "lcd_display": eval_result["lcd_display"]
        },
        "indicators": {
            "camera": "ACTIVE",
            "obstacle_detection": "ACTIVE" if not sim_state["sensors"]["obstacle_detected"] else "TRIGGERED",
            "communication": "CONNECTED",
            "controller_status": "Arduino / ESP32 Online",
            "monitoring_status": "ACTIVE"
        },
        "sensors": sim_state["sensors"],
        "rover": sim_state["rover"],
        "thresholds": SAFETY_THRESHOLDS,
        "triggers": eval_result["triggers"],
        "active_alerts_count": len(active_alerts),
        "workers_can_enter": eval_result["workers_can_enter"]
    })

@app.route("/api/telemetry/stream", methods=["GET"])
def telemetry_sse_stream():
    """Server-Sent Events (SSE) live telemetry stream endpoint."""
    def generate():
        while True:
            try:
                sim_state = simulator.get_state()
                eval_result = safety_engine.evaluate(
                    sim_state["sensors"],
                    sim_state["rover"]["estop_active"]
                )
                active_alerts = get_alerts(status_filter="ACTIVE", limit=50)

                payload = {
                    "timestamp": time.time(),
                    "scenario": sim_state["scenario"],
                    "system_status": eval_result["status"],
                    "display_text": eval_result["display_text"],
                    "hardware_indicators": {
                        "green_led": eval_result["green_led"],
                        "red_led": eval_result["red_led"],
                        "buzzer": eval_result["buzzer"],
                        "lcd_display": eval_result["lcd_display"]
                    },
                    "indicators": {
                        "camera": "ACTIVE",
                        "obstacle_detection": "ACTIVE" if not sim_state["sensors"]["obstacle_detected"] else "TRIGGERED",
                        "communication": "CONNECTED",
                        "controller_status": "Arduino / ESP32 Online",
                        "monitoring_status": "ACTIVE"
                    },
                    "sensors": sim_state["sensors"],
                    "rover": sim_state["rover"],
                    "thresholds": SAFETY_THRESHOLDS,
                    "triggers": eval_result["triggers"],
                    "active_alerts_count": len(active_alerts),
                    "workers_can_enter": eval_result["workers_can_enter"]
                }
                yield f"data: {json.dumps(payload)}\n\n"
                time.sleep(1.0)
            except Exception as e:
                print(f"[SSE STREAM ERROR] {e}")
                time.sleep(2.0)

    return Response(generate(), mimetype="text/event-stream")

@app.route("/api/rover/control", methods=["POST"])
def control_rover():
    data = request.json or {}
    command = data.get("command")
    if not command:
        return jsonify({"status": "error", "message": "Command parameter required"}), 400

    success, msg = simulator.control_rover_manual(command)
    if not success:
        return jsonify({"status": "error", "message": msg}), 400

    return jsonify({
        "status": "success",
        "message": msg,
        "rover": simulator.get_state()["rover"]
    })

@app.route("/api/rover/estop", methods=["POST"])
def toggle_estop():
    data = request.json or {}
    active = data.get("active", True)
    simulator.set_estop(active)
    
    status_text = "activated" if active else "released"
    return jsonify({
        "status": "success",
        "message": f"Emergency Stop {status_text}.",
        "estop_active": active,
        "rover": simulator.get_state()["rover"]
    })

@app.route("/api/rover/servo", methods=["POST"])
def set_camera_servo():
    data = request.json or {}
    angle = data.get("angle", "CENTER")
    success, msg = simulator.set_camera_servo(angle)
    if not success:
        return jsonify({"status": "error", "message": msg}), 400

    return jsonify({
        "status": "success",
        "message": msg,
        "camera_servo_angle": angle
    })

@app.route("/api/alerts", methods=["GET"])
def list_alerts():
    status_filter = request.args.get("status")
    alerts = get_alerts(status_filter=status_filter, limit=100)
    return jsonify({
        "status": "success",
        "alerts": alerts
    })

@app.route("/api/sensors/history", methods=["GET"])
def get_history():
    sensor_type = request.args.get("sensor_type", "mq2_smoke_gas")
    history = get_sensor_history(sensor_type=sensor_type, limit=100)
    
    values = [r["value"] for r in history] if history else [0]
    return jsonify({
        "status": "success",
        "sensor_type": sensor_type,
        "stats": {
            "min": round(min(values), 1) if values else 0,
            "max": round(max(values), 1) if values else 0,
            "avg": round(sum(values) / len(values), 1) if values else 0,
            "current": round(values[-1], 1) if values else 0
        },
        "history": history
    })

@app.route("/api/system/info", methods=["GET"])
def get_system_info():
    return jsonify({
        "status": "success",
        "system_name": "Smart Safety Surveillance Rover",
        "environment": "Industrial / Mining Hazardous Area",
        "hardware": HARDWARE_INVENTORY,
        "thresholds": SAFETY_THRESHOLDS
    })

@app.route("/api/demo/scenario", methods=["POST"])
def trigger_demo_scenario():
    data = request.json or {}
    scenario = data.get("scenario", "normal")
    valid_scenarios = [
        "normal", "danger_gas", "dangerous_gas", "toxic_gas",
        "high_temp", "abnormal_humidity", "obstacle_detected", "emergency_stop"
    ]
    if scenario not in valid_scenarios:
        return jsonify({"status": "error", "message": f"Invalid scenario. Choose from {valid_scenarios}"}), 400

    simulator.set_scenario(scenario)
    return jsonify({
        "status": "success",
        "scenario": scenario,
        "message": f"Scenario switched to: {scenario.upper()}"
    })

if __name__ == "__main__":
    print("Starting Smart Safety Surveillance Rover Server on http://127.0.0.1:5000...")
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
