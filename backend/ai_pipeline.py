"""
Safety Logic Engine for Smart Safety Surveillance Rover.
Evaluates environmental sensor metrics (MQ-2, MQ-135, DHT11/22) against prototype thresholds.
Controls hardware outputs: Green LED, Red LED, Buzzer, and LCD/OLED display text.
"""

from backend.config import SAFETY_THRESHOLDS

class SafetyLogicEngine:
    def __init__(self, thresholds=None):
        self.thresholds = thresholds or SAFETY_THRESHOLDS

    def evaluate(self, sensor_data, estop_active=False):
        """
        Evaluates system status based on exact safety rules:
        If MQ-2 > threshold OR MQ-135 > threshold OR Temp > threshold OR Humidity > threshold:
            Status = DANGER
            Green LED = OFF, Red LED = ON, Buzzer = ON
            Display = "DANGER – EVACUATE"
        Else:
            Status = SAFE
            Green LED = ON, Red LED = OFF, Buzzer = OFF
            Display = "AREA SAFE – WORKERS CAN ENTER"
        """
        mq2 = sensor_data.get("mq2_smoke_gas", 120.0)
        mq135 = sensor_data.get("mq135_toxic_gas", 150.0)
        temp = sensor_data.get("temperature", 29.0)
        hum = sensor_data.get("humidity", 60.0)

        mq2_thresh = self.thresholds["mq2_smoke_gas"]["danger"]
        mq135_thresh = self.thresholds["mq135_toxic_gas"]["danger"]
        temp_thresh = self.thresholds["temperature"]["danger"]
        hum_thresh = self.thresholds["humidity"]["danger"]

        triggers = []
        if mq2 > mq2_thresh:
            triggers.append({
                "sensor": "MQ-2 Smoke/Gas Sensor",
                "value": mq2,
                "threshold": mq2_thresh,
                "unit": "ppm",
                "message": f"DANGER – SMOKE/GAS DETECTED ({mq2:.1f} ppm > {mq2_thresh:.1f} ppm)"
            })
        if mq135 > mq135_thresh:
            triggers.append({
                "sensor": "MQ-135 Harmful/Toxic Gas Sensor",
                "value": mq135,
                "threshold": mq135_thresh,
                "unit": "ppm",
                "message": f"DANGER – HARMFUL GAS DETECTED ({mq135:.1f} ppm > {mq135_thresh:.1f} ppm)"
            })
        if temp > temp_thresh:
            triggers.append({
                "sensor": "DHT11/DHT22 Temperature Sensor",
                "value": temp,
                "threshold": temp_thresh,
                "unit": "°C",
                "message": f"DANGER – HIGH TEMPERATURE ({temp:.1f} °C > {temp_thresh:.1f} °C)"
            })
        if hum > hum_thresh:
            triggers.append({
                "sensor": "DHT11/DHT22 Humidity Sensor",
                "value": hum,
                "threshold": hum_thresh,
                "unit": "%",
                "message": f"DANGER – ABNORMAL HUMIDITY ({hum:.1f}% > {hum_thresh:.1f}%)"
            })

        is_danger = len(triggers) > 0 or estop_active

        if is_danger:
            status = "DANGER"
            green_led = "OFF"
            red_led = "ON"
            buzzer = "ON"
            display_text = "DANGER – EVACUATE"
            lcd_text_line1 = "GAS/TEMP: HIGH"
            lcd_text_line2 = "STATUS: DANGER"
            lcd_text_line3 = "EVACUATE AREA!"
        else:
            status = "SAFE"
            green_led = "ON"
            red_led = "OFF"
            buzzer = "OFF"
            display_text = "AREA SAFE – WORKERS CAN ENTER"
            lcd_text_line1 = f"TEMP:{temp:.0f}C HUM:{hum:.0f}%"
            lcd_text_line2 = "GAS: NORMAL"
            lcd_text_line3 = "STATUS: SAFE"

        return {
            "status": status,
            "display_text": display_text,
            "green_led": green_led,
            "red_led": red_led,
            "buzzer": buzzer,
            "lcd_display": {
                "line1": lcd_text_line1,
                "line2": lcd_text_line2,
                "line3": lcd_text_line3
            },
            "triggers": triggers,
            "workers_can_enter": status == "SAFE" and not estop_active
        }
