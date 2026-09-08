# Smart Safety Surveillance Rover for Industrial/Mining Hazardous Environment 🤖⚡

An integrated remote surveillance command station for an autonomous hazard-inspection rover operating in hazardous industrial and subterranean mining areas.

---

## 1. Core Operating Concept

- **Area Pre-Inspection**: Initially, the hazardous area is **EMPTY**. Workers are **NOT allowed to enter** until the surveillance rover inspects the environment and confirms safety.
- **Autonomous & Remote Patrol**: The rover moves through the area, avoids obstacles, measures MQ-2 smoke/gas, MQ-135 toxic gas, DHT11/22 temperature and humidity, provides camera surveillance, and streams data to the remote monitoring station.

### SAFE MODE vs DANGER MODE Logic

```
                          +------------------------------------+
                          |     Initial Inspection by Rover    |
                          +-----------------+------------------+
                                            |
                         Is (MQ-2 > 400 ppm OR MQ-135 > 500 ppm
                         OR Temp > 40°C OR Humidity > 80%) ?
                                            |
                     +----------------------+----------------------+
                     | YES                                         | NO
                     v                                             v
        +--------------------------+                  +--------------------------+
        |       DANGER MODE        |                  |        SAFE MODE         |
        | Display: DANGER–EVACUATE |                  | Display: AREA SAFE–      |
        | Green LED: OFF           |                  |          WORKERS CAN ENTER|
        | Red LED: ON              |                  | Green LED: ON            |
        | Buzzer: ON               |                  | Red LED: OFF             |
        | Emergency Alert: ON      |                  | Buzzer: OFF              |
        +------------+-------------+                  +------------+-------------+
                     |                                             |
                     v                                             v
           WORKERS EVACUATE AREA                        WORKERS CAN ENTER AREA
                     |                                             |
                     +----------------------+----------------------+
                                            |
                                            v
                            CONTINUOUS MONITORING & SURVEILLANCE
```

---

## 2. Hardware Inventory (Exact 15 Components)

1. **Arduino Uno or ESP32**: Main microcontroller executing sensor polling, safety threshold evaluation, LED/buzzer outputs, motor driver signals, and wireless transmission.
2. **MQ-2 Gas Sensor**: Smoke and flammable gas detection (ppm). Prototype threshold: `400 ppm`.
3. **MQ-135 Gas Sensor**: Harmful and toxic gas detection (CO, ppm). Prototype threshold: `500 ppm`.
4. **DHT11 / DHT22 Sensor**: Temperature (°C) and humidity (%) sensor. Prototype thresholds: `40°C` and `80%`.
5. **Ultrasonic Sensors**: Measures front, left, and right obstacle distances (cm). Automatically stops motors if obstacle distance `< 20 cm`.
6. **Camera Module**: Provides live camera surveillance feed of the hazardous area.
7. **Servo Motor**: Rotates camera angle (`LEFT -45°`, `CENTER 0°`, `RIGHT +45°`).
8. **L298N Motor Driver**: H-bridge dual motor driver controlling speed and rotation direction of DC propulsion motors.
9. **DC Motors (x2)**: Drives left and right wheels for rover movement.
10. **Buzzer**: Audible emergency danger alarm. (`ON` in DANGER mode, `OFF` in SAFE mode).
11. **Red LED**: Visual danger indicator (`ON` in DANGER mode, `OFF` in SAFE mode).
12. **Green LED**: Visual safe indicator (`ON` in SAFE mode: "WORKERS CAN ENTER", `OFF` in DANGER mode).
13. **LCD / OLED Display**: Local 16x2 / OLED display rendering status text banners (`"AREA SAFE – WORKERS CAN ENTER"` or `"DANGER – EVACUATE"`).
14. **Emergency-Stop Push Button**: Hardware push button. Pressing it immediately freezes DC motors.
15. **Wi-Fi / Bluetooth Module**: Wireless telemetry link transmitting sensor data to the remote monitoring station.

---

## 3. Website Structure (7 Navigation Sections)

1. **Dashboard**: Main monitoring station screen displaying system status (`SAFE` / `DANGER`), worker entry advisory banner (`"AREA SAFE – WORKERS CAN ENTER"`), hardware LED/Buzzer outputs, 16x2 LCD widget, and MQ-2, MQ-135, DHT11/22 readings.
2. **Rover Monitoring**: Displays Arduino/ESP32 status, L298N motor driver states, Left/Right DC motor direction, D-Pad movement controls (`FORWARD`, `BACKWARD`, `LEFT`, `RIGHT`, `STOP`), Emergency Stop button, and Ultrasonic distance obstacle avoidance widget.
3. **Environmental Monitoring**: Displays specified environmental sensors (MQ-2, MQ-135, DHT Temperature, DHT Humidity) with prototype thresholds and real-time SVG charts.
4. **Camera Surveillance**: Dedicated live camera feed (`SIMULATED CAMERA FEED`) with Servo motor camera angle rotation controls (`LEFT`, `CENTER`, `RIGHT`).
5. **Alerts**: Relevant system alerts log (`DANGER – SMOKE/GAS DETECTED`, `DANGER – HARMFUL GAS DETECTED`, `DANGER – HIGH TEMPERATURE`, `DANGER – ABNORMAL HUMIDITY`, `OBSTACLE DETECTED`, `EMERGENCY STOP ACTIVATED`).
6. **Simulation**: Demonstration panel with master mode toggles (`SAFE MODE` vs `DANGER MODE`) and 7 exact test scenarios.
7. **System Information**: Detailed specifications of the 15 hardware components.

---

## 4. 7 Exact Simulation Scenarios

1. `Normal Environment`: All metrics nominal (MQ-2: 120 ppm, MQ-135: 150 ppm, Temp: 29°C, Hum: 60%). System: SAFE.
2. `Dangerous Gas/Smoke`: MQ-2 spikes to 650 ppm (> 400 ppm). System: DANGER.
3. `Harmful/Toxic Gas`: MQ-135 spikes to 750 ppm (> 500 ppm). System: DANGER.
4. `Excessive Temperature`: Temperature spikes to 48°C (> 40°C). System: DANGER.
5. `Abnormal Humidity`: Humidity spikes to 92% (> 80%). System: DANGER.
6. `Obstacle Detected`: Ultrasonic front distance < 20 cm. Rover stops and displays `OBSTACLE DETECTED`.
7. `Emergency Stop`: E-stop pressed. DC motors freeze immediately.

---

## 5. How to Run

### Command:
```powershell
python start_system.py
```

- **URL**: `http://127.0.0.1:5000`
