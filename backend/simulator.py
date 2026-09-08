"""
Real-time Simulator for Smart Safety Surveillance Rover Hardware and Environment.
Simulates MQ-2, MQ-135, DHT11/22, Ultrasonic distance, L298N motors, Camera Servo, LEDs, and Buzzer.
"""

import random
import time
import threading
from backend.config import SAFETY_THRESHOLDS, ROVER_CONFIG
from backend.database import log_sensor_reading, create_alert, clear_alert

class RoverSimulator:
    def __init__(self):
        self.lock = threading.Lock()
        self.running = False

        # Current Operating Scenario (1 of 7 exact scenarios)
        self.scenario = "normal"

        # Hardware Sensor Readings
        self.sensors = {
            "mq2_smoke_gas": 120.0,      # MQ-2 Smoke/Gas (ppm)
            "mq135_toxic_gas": 150.0,    # MQ-135 Harmful/Toxic Gas (ppm)
            "temperature": 29.0,         # DHT11/22 Temperature (°C)
            "humidity": 60.0,            # DHT11/22 Humidity (%)
            "ultrasonic_front": 120.0,   # Ultrasonic Front Distance (cm)
            "ultrasonic_left": 140.0,    # Ultrasonic Left Distance (cm)
            "ultrasonic_right": 130.0,   # Ultrasonic Right Distance (cm)
            "obstacle_detected": False
        }

        # Rover Motor & Hardware State
        self.rover = {
            "id": ROVER_CONFIG["id"],
            "controller": "Arduino Uno / ESP32",
            "motor_driver": "L298N Dual Motor Driver",
            "left_motor": "FORWARD",
            "right_motor": "FORWARD",
            "movement_status": "PATROLLING",
            "camera_servo_angle": "CENTER", # LEFT, CENTER, RIGHT
            "obstacle_status": "CLEAR",
            "estop_active": False,
            "comms_status": "CONNECTED"
        }

        self.sim_thread = None

    def start(self):
        if not self.running:
            self.running = True
            self.sim_thread = threading.Thread(target=self._simulation_loop, daemon=True)
            self.sim_thread.start()

    def set_scenario(self, scenario_name):
        with self.lock:
            self.scenario = scenario_name

            if scenario_name == "normal":
                self.sensors["mq2_smoke_gas"] = 120.0
                self.sensors["mq135_toxic_gas"] = 150.0
                self.sensors["temperature"] = 29.0
                self.sensors["humidity"] = 60.0
                self.sensors["ultrasonic_front"] = 120.0
                self.sensors["obstacle_detected"] = False
                self.rover["estop_active"] = False
                self.rover["movement_status"] = "PATROLLING"
                self.rover["left_motor"] = "FORWARD"
                self.rover["right_motor"] = "FORWARD"
                self.rover["obstacle_status"] = "CLEAR"

            elif scenario_name in ["danger_gas", "dangerous_gas"]:
                self.sensors["mq2_smoke_gas"] = 650.0 # Exceeds 400 ppm
            elif scenario_name == "toxic_gas":
                self.sensors["mq135_toxic_gas"] = 750.0 # Exceeds 500 ppm
            elif scenario_name == "high_temp":
                self.sensors["temperature"] = 48.0 # Exceeds 40°C
            elif scenario_name == "abnormal_humidity":
                self.sensors["humidity"] = 92.0 # Exceeds 80%
            elif scenario_name == "obstacle_detected":
                self.sensors["ultrasonic_front"] = 12.0 # < 20 cm
                self.sensors["obstacle_detected"] = True
                self.rover["left_motor"] = "STOP"
                self.rover["right_motor"] = "STOP"
                self.rover["movement_status"] = "STOPPED (OBSTACLE DETECTED)"
                self.rover["obstacle_status"] = "OBSTACLE DETECTED (< 20 cm)"
            elif scenario_name == "emergency_stop":
                self.set_estop(True)

    def set_estop(self, active=True):
        with self.lock:
            self.rover["estop_active"] = active
            if active:
                self.rover["left_motor"] = "STOP"
                self.rover["right_motor"] = "STOP"
                self.rover["movement_status"] = "STOPPED (EMERGENCY STOP ACTIVE)"
                create_alert("EMERGENCY STOP ACTIVATED", "Emergency Push Button", 1.0, 0.0, "Hardware Emergency Stop button pressed.")
            else:
                self.rover["movement_status"] = "PATROLLING"
                self.rover["left_motor"] = "FORWARD"
                self.rover["right_motor"] = "FORWARD"
                clear_alert("EMERGENCY STOP ACTIVATED")

    def control_rover_manual(self, command):
        with self.lock:
            if self.rover["estop_active"]:
                return False, "Cannot move rover while Emergency Stop is active."

            if command == "forward":
                self.rover["left_motor"] = "FORWARD"
                self.rover["right_motor"] = "FORWARD"
                self.rover["movement_status"] = "MOVING FORWARD"
            elif command == "backward":
                self.rover["left_motor"] = "REVERSE"
                self.rover["right_motor"] = "REVERSE"
                self.rover["movement_status"] = "MOVING BACKWARD"
            elif command == "left":
                self.rover["left_motor"] = "REVERSE"
                self.rover["right_motor"] = "FORWARD"
                self.rover["movement_status"] = "TURNING LEFT"
            elif command == "right":
                self.rover["left_motor"] = "FORWARD"
                self.rover["right_motor"] = "REVERSE"
                self.rover["movement_status"] = "TURNING RIGHT"
            elif command == "stop":
                self.rover["left_motor"] = "STOP"
                self.rover["right_motor"] = "STOP"
                self.rover["movement_status"] = "STOPPED (MANUAL HOLD)"

            return True, f"Rover command '{command.upper()}' sent to L298N Driver."

    def set_camera_servo(self, angle):
        with self.lock:
            if angle in ["LEFT", "CENTER", "RIGHT"]:
                self.rover["camera_servo_angle"] = angle
                return True, f"Camera servo rotated to {angle}."
            return False, "Invalid servo angle."

    def _simulation_loop(self):
        tick = 0
        while self.running:
            try:
                time.sleep(1.0)
                tick += 1

                with self.lock:
                    self._update_sensor_physics(tick)
                    self._update_alert_states()

            except Exception as e:
                print(f"[SIMULATOR ERROR] {e}")

    def _update_sensor_physics(self, tick):
        s = self.scenario
        if s == "normal":
            self.sensors["mq2_smoke_gas"] = max(80.0, min(250.0, self.sensors["mq2_smoke_gas"] + random.uniform(-2.0, 2.0)))
            self.sensors["mq135_toxic_gas"] = max(100.0, min(300.0, self.sensors["mq135_toxic_gas"] + random.uniform(-3.0, 3.0)))
            self.sensors["temperature"] = max(24.0, min(34.0, self.sensors["temperature"] + random.uniform(-0.2, 0.2)))
            self.sensors["humidity"] = max(45.0, min(75.0, self.sensors["humidity"] + random.uniform(-0.5, 0.5)))
            self.sensors["ultrasonic_front"] = max(80.0, min(200.0, self.sensors["ultrasonic_front"] + random.uniform(-2.0, 2.0)))
            self.sensors["obstacle_detected"] = False
            if not self.rover["estop_active"]:
                self.rover["obstacle_status"] = "CLEAR"

        # Log periodic telemetry
        if tick % 5 == 0:
            log_sensor_reading(
                self.sensors["mq2_smoke_gas"],
                self.sensors["mq135_toxic_gas"],
                self.sensors["temperature"],
                self.sensors["humidity"],
                self.sensors["ultrasonic_front"],
                self.sensors["ultrasonic_left"],
                self.sensors["ultrasonic_right"],
                self.sensors["obstacle_detected"]
            )

    def _update_alert_states(self):
        # MQ-2 Smoke/Gas check
        if self.sensors["mq2_smoke_gas"] > SAFETY_THRESHOLDS["mq2_smoke_gas"]["danger"]:
            create_alert("DANGER – SMOKE/GAS DETECTED", "MQ-2 Gas Sensor", round(self.sensors["mq2_smoke_gas"], 1), SAFETY_THRESHOLDS["mq2_smoke_gas"]["danger"], f"MQ-2 Smoke/Gas level {self.sensors['mq2_smoke_gas']:.1f} ppm exceeds threshold {SAFETY_THRESHOLDS['mq2_smoke_gas']['danger']} ppm!")
        else:
            clear_alert("DANGER – SMOKE/GAS DETECTED")

        # MQ-135 Harmful/Toxic Gas check
        if self.sensors["mq135_toxic_gas"] > SAFETY_THRESHOLDS["mq135_toxic_gas"]["danger"]:
            create_alert("DANGER – HARMFUL GAS DETECTED", "MQ-135 Toxic Gas Sensor", round(self.sensors["mq135_toxic_gas"], 1), SAFETY_THRESHOLDS["mq135_toxic_gas"]["danger"], f"MQ-135 Harmful Gas level {self.sensors['mq135_toxic_gas']:.1f} ppm exceeds threshold {SAFETY_THRESHOLDS['mq135_toxic_gas']['danger']} ppm!")
        else:
            clear_alert("DANGER – HARMFUL GAS DETECTED")

        # Temperature check
        if self.sensors["temperature"] > SAFETY_THRESHOLDS["temperature"]["danger"]:
            create_alert("DANGER – HIGH TEMPERATURE", "DHT11/DHT22 Temp Sensor", round(self.sensors["temperature"], 1), SAFETY_THRESHOLDS["temperature"]["danger"], f"Temperature level {self.sensors['temperature']:.1f} °C exceeds threshold {SAFETY_THRESHOLDS['temperature']['danger']} °C!")
        else:
            clear_alert("DANGER – HIGH TEMPERATURE")

        # Humidity check
        if self.sensors["humidity"] > SAFETY_THRESHOLDS["humidity"]["danger"]:
            create_alert("DANGER – ABNORMAL HUMIDITY", "DHT11/DHT22 Humidity Sensor", round(self.sensors["humidity"], 1), SAFETY_THRESHOLDS["humidity"]["danger"], f"Humidity level {self.sensors['humidity']:.1f}% exceeds threshold {SAFETY_THRESHOLDS['humidity']['danger']}%!")
        else:
            clear_alert("DANGER – ABNORMAL HUMIDITY")

        # Obstacle check
        if self.sensors["ultrasonic_front"] < SAFETY_THRESHOLDS["ultrasonic_obstacle"]["warning_distance"]:
            create_alert("OBSTACLE DETECTED", "Ultrasonic Distance Sensor", round(self.sensors["ultrasonic_front"], 1), SAFETY_THRESHOLDS["ultrasonic_obstacle"]["warning_distance"], f"Front Obstacle detected at {self.sensors['ultrasonic_front']:.1f} cm (< 20.0 cm)!")
        else:
            clear_alert("OBSTACLE DETECTED")

    def get_state(self):
        with self.lock:
            return {
                "scenario": self.scenario,
                "sensors": self.sensors.copy(),
                "rover": self.rover.copy()
            }
