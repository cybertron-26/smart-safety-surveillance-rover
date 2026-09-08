"""
System Configuration for Smart Safety Surveillance Rover
Industrial / Mining Hazardous Environment System
"""

import os

# Base paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
DB_PATH = os.path.join(PROJECT_ROOT, "mine_safety.db")

# Prototype / Simulation Safety Thresholds
SAFETY_THRESHOLDS = {
    "mq2_smoke_gas": {
        "unit": "ppm",
        "danger": 400.0,     # MQ-2 Smoke/Gas threshold
        "normal": 120.0,
        "name": "MQ-2 Smoke/Gas Sensor"
    },
    "mq135_toxic_gas": {
        "unit": "ppm",
        "danger": 500.0,     # MQ-135 Harmful/Toxic gas threshold
        "normal": 150.0,
        "name": "MQ-135 Harmful/Toxic Gas Sensor"
    },
    "temperature": {
        "unit": "°C",
        "danger": 40.0,      # DHT11/DHT22 Temperature threshold
        "normal": 29.0,
        "name": "DHT11/DHT22 Temperature Sensor"
    },
    "humidity": {
        "unit": "%",
        "danger": 80.0,      # DHT11/DHT22 Humidity threshold
        "normal": 60.0,
        "name": "DHT11/DHT22 Humidity Sensor"
    },
    "ultrasonic_obstacle": {
        "unit": "cm",
        "warning_distance": 20.0, # Ultrasonic distance threshold
        "normal_distance": 120.0,
        "name": "Ultrasonic Distance Sensors"
    }
}

# Hardware Specification Inventory
HARDWARE_INVENTORY = [
    {"component": "Arduino Uno / ESP32", "role": "Main Microcontroller Board"},
    {"component": "MQ-2 Sensor", "role": "Smoke & Flammable Gas Detection"},
    {"component": "MQ-135 Sensor", "role": "Harmful & Toxic Gas Detection"},
    {"component": "DHT11 / DHT22 Sensor", "role": "Ambient Temperature & Humidity Measurement"},
    {"component": "Ultrasonic Sensors", "role": "Front / Side Obstacle Detection"},
    {"component": "Camera Module", "role": "Live Visual Surveillance Feed"},
    {"component": "Servo Motor", "role": "Camera Angle Rotation (Left / Center / Right)"},
    {"component": "L298N Motor Driver", "role": "Dual DC Motor Control & H-Bridge Driving"},
    {"component": "DC Motors (x2)", "role": "Rover Movement & Chassis Propulsion"},
    {"component": "Buzzer", "role": "Audible Emergency Danger Alarm"},
    {"component": "Red LED", "role": "Danger Mode Visual Indicator"},
    {"component": "Green LED", "role": "Safe Mode Visual Indicator (Workers Can Enter)"},
    {"component": "LCD / OLED Display", "role": "Local Status & Environmental Text Display"},
    {"component": "Emergency-Stop Push Button", "role": "Hardware Emergency Stop Switch"},
    {"component": "Wi-Fi / Bluetooth Module", "role": "Remote Station Telemetry Link"}
]

# Rover Default Hardware State
ROVER_CONFIG = {
    "id": "SAFETY-ROVER-01",
    "name": "Industrial Hazardous Area Surveillance Rover",
    "controller": "Arduino Uno / ESP32",
    "motor_driver": "L298N Dual H-Bridge Driver",
    "left_motor": "STOP",
    "right_motor": "STOP",
    "camera_servo_angle": "CENTER", # LEFT, CENTER, RIGHT
    "comms_module": "Wi-Fi / Bluetooth",
    "comms_status": "CONNECTED"
}
