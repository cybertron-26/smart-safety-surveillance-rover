import React from 'react';
import { Info, Cpu, HardDrive } from 'lucide-react';

export const SystemInfoPage = () => {
  const hardwareList = [
    { num: 1, name: "Arduino Uno or ESP32", role: "Main Microcontroller Board", purpose: "Executes sensor polling, safety threshold evaluation, LED/buzzer outputs, motor driver signals, and remote wireless transmission." },
    { num: 2, name: "MQ-2 Gas Sensor", role: "Smoke & Flammable Gas Detection", purpose: "Measures combustible gas and smoke levels (ppm). Triggers DANGER mode if reading exceeds prototype threshold (400 ppm)." },
    { num: 3, name: "MQ-135 Gas Sensor", role: "Harmful & Toxic Gas Detection", purpose: "Measures toxic gas concentrations (CO, Ammonia, Sulfide ppm). Triggers DANGER mode if reading exceeds threshold (500 ppm)." },
    { num: 4, name: "DHT11 / DHT22 Sensor", role: "Temperature & Humidity Sensor", purpose: "Measures ambient temperature (°C) and relative humidity (%). Triggers DANGER mode if temp > 40°C or humidity > 80%." },
    { num: 5, name: "Ultrasonic Sensors", role: "Obstacle Detection & Distance", purpose: "Measures front, left, and right obstacle distances (cm). Automatically stops DC motors if obstacle < 20 cm." },
    { num: 6, name: "Camera Module", role: "Live Visual Surveillance", purpose: "Provides continuous live video feed of hazardous area to remote monitoring station." },
    { num: 7, name: "Servo Motor", role: "Camera Angle Rotation", purpose: "Rotates camera module angle (LEFT -45°, CENTER 0°, RIGHT +45°) for wide-angle area inspection." },
    { num: 8, name: "L298N Motor Driver", role: "Dual H-Bridge DC Motor Driver", purpose: "Controls speed and rotation direction (Forward, Reverse, Left, Right, Stop) of two DC propulsion motors." },
    { num: 9, name: "DC Motors (x2)", role: "Rover Propulsion & Chassis Movement", purpose: "Drives left and right wheels for remote teleoperation and autonomous area surveillance patrol." },
    { num: 10, name: "Buzzer", role: "Emergency Audible Alarm", purpose: "Sounds loud audible alarm during DANGER MODE. OFF during SAFE MODE." },
    { num: 11, name: "Red LED", role: "Danger Mode Visual Indicator", purpose: "Illuminates RED during DANGER MODE (Evacuate). OFF during SAFE MODE." },
    { num: 12, name: "Green LED", role: "Safe Mode Visual Indicator", purpose: "Illuminates GREEN during SAFE MODE (Area Safe - Workers Can Enter). OFF during DANGER MODE." },
    { num: 13, name: "LCD / OLED Display", role: "Local Status & Environmental Display", purpose: "Displays real-time text banners locally on rover ('AREA SAFE – WORKERS CAN ENTER' or 'DANGER – EVACUATE')." },
    { num: 14, name: "Emergency-Stop Push Button", role: "Hardware Emergency Shutdown", purpose: "Physical red push button. When pressed, immediately trips L298N motor driver to freeze left/right DC motors." },
    { num: 15, name: "Wi-Fi / Bluetooth Module", role: "Remote Monitoring Telemetry Link", purpose: "Transmits real-time sensor metrics, video feed, and system status wirelessly to remote monitoring station web dashboard." }
  ];

  return (
    <div className="space-y-6">
      
      <div className="glass-card p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2 font-mono">
              <Info className="w-5 h-5 text-cyan-400" />
              SYSTEM INFORMATION & HARDWARE SPECIFICATIONS
            </h2>
            <p className="text-xs text-slate-400">Inventory of specified hardware components and their system roles</p>
          </div>

          <span className="px-3 py-1 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded font-mono text-xs font-bold">
            15 HARDWARE COMPONENTS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hardwareList.map((hw) => (
            <div key={hw.num} className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono text-xs font-bold flex items-center justify-center">
                    {hw.num}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    HARDWARE COMPONENT
                  </span>
                </div>

                <h3 className="text-sm font-bold font-mono text-slate-100">{hw.name}</h3>
                <span className="text-xs font-mono text-cyan-400 font-semibold block mt-0.5">{hw.role}</span>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{hw.purpose}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
