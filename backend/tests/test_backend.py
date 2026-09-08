"""
Backend Automated Test Suite for Smart Safety Surveillance Rover
"""

import sys
import os
import unittest
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app import app, simulator
from backend.ai_pipeline import SafetyLogicEngine
from backend.database import init_db

class BackendTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        init_db()
        self.safety_engine = SafetyLogicEngine()

    def test_system_status_api(self):
        res = self.app.get('/api/system/status')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn('system_status', data)
        self.assertIn('hardware_indicators', data)
        self.assertIn('sensors', data)

    def test_safety_logic_safe_mode(self):
        mock_sensors = {
            "mq2_smoke_gas": 120.0,
            "mq135_toxic_gas": 150.0,
            "temperature": 29.0,
            "humidity": 60.0
        }
        res = self.safety_engine.evaluate(mock_sensors)
        self.assertEqual(res["status"], "SAFE")
        self.assertEqual(res["green_led"], "ON")
        self.assertEqual(res["red_led"], "OFF")
        self.assertEqual(res["buzzer"], "OFF")
        self.assertEqual(res["display_text"], "AREA SAFE – WORKERS CAN ENTER")

    def test_safety_logic_danger_mode(self):
        mock_sensors = {
            "mq2_smoke_gas": 650.0, # > 400 danger
            "mq135_toxic_gas": 150.0,
            "temperature": 29.0,
            "humidity": 60.0
        }
        res = self.safety_engine.evaluate(mock_sensors)
        self.assertEqual(res["status"], "DANGER")
        self.assertEqual(res["green_led"], "OFF")
        self.assertEqual(res["red_led"], "ON")
        self.assertEqual(res["buzzer"], "ON")
        self.assertEqual(res["display_text"], "DANGER – EVACUATE")

    def test_rover_control_api(self):
        res = self.app.post('/api/rover/control', json={"command": "forward"})
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['status'], 'success')

    def test_camera_servo_api(self):
        res = self.app.post('/api/rover/servo', json={"angle": "LEFT"})
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['camera_servo_angle'], 'LEFT')

    def test_estop_toggle_api(self):
        res = self.app.post('/api/rover/estop', json={"active": True})
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data['estop_active'])

        # Reset estop
        self.app.post('/api/rover/estop', json={"active": False})

    def test_demo_scenario_switch(self):
        scenarios = ["normal", "danger_gas", "toxic_gas", "high_temp", "abnormal_humidity", "obstacle_detected", "emergency_stop"]
        for s in scenarios:
            res = self.app.post('/api/demo/scenario', json={"scenario": s})
            self.assertEqual(res.status_code, 200)

    def test_system_info_api(self):
        res = self.app.get('/api/system/info')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(len(data['hardware']), 15)

if __name__ == '__main__':
    unittest.main()
