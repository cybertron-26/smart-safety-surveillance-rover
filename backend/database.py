"""
Database management for Smart Safety Surveillance Rover using SQLite
"""

import sqlite3
import json
import os
from datetime import datetime, timezone
from backend.config import DB_PATH, SAFETY_THRESHOLDS, ROVER_CONFIG, HARDWARE_INVENTORY

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Telemetry table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sensor_telemetry (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            mq2_smoke_gas REAL NOT NULL,
            mq135_toxic_gas REAL NOT NULL,
            temperature REAL NOT NULL,
            humidity REAL NOT NULL,
            ultrasonic_front REAL NOT NULL,
            ultrasonic_left REAL NOT NULL,
            ultrasonic_right REAL NOT NULL,
            obstacle_detected INTEGER DEFAULT 0
        )
    ''')
    
    # Alerts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            alert_type TEXT NOT NULL,
            sensor_name TEXT NOT NULL,
            value REAL,
            threshold REAL,
            description TEXT NOT NULL,
            status TEXT NOT NULL
        )
    ''')
    
    # Settings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS system_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    ''')
    
    # Seed default settings if empty
    cursor.execute("SELECT COUNT(*) FROM system_settings")
    if cursor.fetchone()[0] == 0:
        now = datetime.now(timezone.utc).isoformat()
        cursor.execute("INSERT INTO system_settings VALUES (?, ?, ?)", 
                       ("safety_thresholds", json.dumps(SAFETY_THRESHOLDS), now))
        cursor.execute("INSERT INTO system_settings VALUES (?, ?, ?)", 
                       ("rover_config", json.dumps(ROVER_CONFIG), now))

    conn.commit()
    conn.close()

def log_sensor_reading(mq2, mq135, temp, hum, front_dist, left_dist, right_dist, obstacle):
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    cursor.execute('''
        INSERT INTO sensor_telemetry (timestamp, mq2_smoke_gas, mq135_toxic_gas, temperature, humidity, ultrasonic_front, ultrasonic_left, ultrasonic_right, obstacle_detected)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (now, mq2, mq135, temp, hum, front_dist, left_dist, right_dist, 1 if obstacle else 0))
    conn.commit()
    conn.close()

def create_alert(alert_type, sensor_name, value, threshold, description):
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    
    # Check if duplicate active alert exists
    cursor.execute('''
        SELECT id FROM alerts WHERE alert_type = ? AND status = 'ACTIVE'
    ''', (alert_type,))
    existing = cursor.fetchone()
    
    if not existing:
        cursor.execute('''
            INSERT INTO alerts (timestamp, alert_type, sensor_name, value, threshold, description, status)
            VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
        ''', (now, alert_type, sensor_name, value, threshold, description))
        
    conn.commit()
    conn.close()

def clear_alert(alert_type):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE alerts SET status = 'RESOLVED' WHERE alert_type = ? AND status = 'ACTIVE'
    ''', (alert_type,))
    conn.commit()
    conn.close()

def get_alerts(status_filter=None, limit=100):
    conn = get_db_connection()
    cursor = conn.cursor()
    if status_filter:
        cursor.execute('SELECT * FROM alerts WHERE status = ? ORDER BY id DESC LIMIT ?', (status_filter, limit))
    else:
        cursor.execute('SELECT * FROM alerts ORDER BY id DESC LIMIT ?', (limit,))
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows

def get_sensor_history(sensor_type="mq2_smoke_gas", limit=100):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    valid = ["mq2_smoke_gas", "mq135_toxic_gas", "temperature", "humidity"]
    if sensor_type not in valid:
        sensor_type = "mq2_smoke_gas"
        
    cursor.execute(f'SELECT id, timestamp, {sensor_type} as value FROM sensor_telemetry ORDER BY id DESC LIMIT ?', (limit,))
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return list(reversed(rows))
