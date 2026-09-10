#include <Arduino.h>
#include <SPI.h>
#include <LoRa.h>
#include <DHT.h>

// =====================================================
//                    MOTOR PINS
// =====================================================

#define PWMA 25
#define AIN1 26
#define AIN2 27

#define PWMB 14
#define BIN1 32
#define BIN2 33

#define STBY 13

// =====================================================
//                    SENSOR PINS
// =====================================================

#define MQ2_PIN   34
#define MQ3_PIN   35
#define MQ135_PIN 36

#define DHT_PIN 4
#define DHT_TYPE DHT22

#define FAN_PIN 16

// =====================================================
//                    LORA PINS
// =====================================================

#define LORA_SCK  18
#define LORA_MISO 19
#define LORA_MOSI 23
#define LORA_CS   5
#define LORA_RST  17
#define LORA_DIO0 2

// Change this if your LoRa module uses a different frequency
#define LORA_FREQUENCY 433E6

// =====================================================
//                    OBJECTS
// =====================================================

DHT dht(DHT_PIN, DHT_TYPE);

// =====================================================
//                    SETTINGS
// =====================================================

// Motor speed: 0 - 255
int motorSpeed = 180;

// Hazard thresholds
// THESE ARE STARTING VALUES ONLY.
// Calibrate them using your actual sensors.
int MQ2_LIMIT   = 1800;
int MQ3_LIMIT   = 1800;
int MQ135_LIMIT = 1800;

float TEMP_LIMIT = 45.0;

// =====================================================
//                    VARIABLES
// =====================================================

int mq2Value = 0;
int mq3Value = 0;
int mq135Value = 0;

float temperature = 0;
float humidity = 0;

bool hazardDetected = false;

unsigned long lastSensorRead = 0;
unsigned long lastLoRaSend = 0;

// =====================================================
//                    MOTOR FUNCTIONS
// =====================================================

void motorA(int speedValue) {

  speedValue = constrain(speedValue, -255, 255);

  if (speedValue > 0) {

    digitalWrite(AIN1, HIGH);
    digitalWrite(AIN2, LOW);

    analogWrite(PWMA, speedValue);

  } 
  else if (speedValue < 0) {

    digitalWrite(AIN1, LOW);
    digitalWrite(AIN2, HIGH);

    analogWrite(PWMA, -speedValue);

  } 
  else {

    digitalWrite(AIN1, LOW);
    digitalWrite(AIN2, LOW);

    analogWrite(PWMA, 0);
  }
}


void motorB(int speedValue) {

  speedValue = constrain(speedValue, -255, 255);

  if (speedValue > 0) {

    digitalWrite(BIN1, HIGH);
    digitalWrite(BIN2, LOW);

    analogWrite(PWMB, speedValue);

  } 
  else if (speedValue < 0) {

    digitalWrite(BIN1, LOW);
    digitalWrite(BIN2, HIGH);

    analogWrite(PWMB, -speedValue);

  } 
  else {

    digitalWrite(BIN1, LOW);
    digitalWrite(BIN2, LOW);

    analogWrite(PWMB, 0);
  }
}


// =====================================================
//                    MOVEMENT
// =====================================================

void moveForward() {

  if (hazardDetected) {
    stopRover();
    return;
  }

  motorA(motorSpeed);
  motorB(motorSpeed);
}


void moveBackward() {

  motorA(-motorSpeed);
  motorB(-motorSpeed);
}


void turnLeft() {

  if (hazardDetected) {
    stopRover();
    return;
  }

  motorA(-motorSpeed);
  motorB(motorSpeed);
}


void turnRight() {

  if (hazardDetected) {
    stopRover();
    return;
  }

  motorA(motorSpeed);
  motorB(-motorSpeed);
}


void stopRover() {

  motorA(0);
  motorB(0);
}


// =====================================================
//                    FAN
// =====================================================

void fanON() {
  digitalWrite(FAN_PIN, HIGH);
}

void fanOFF() {
  digitalWrite(FAN_PIN, LOW);
}


// =====================================================
//                    SENSOR READING
// =====================================================

void readSensors() {

  mq2Value = analogRead(MQ2_PIN);
  mq3Value = analogRead(MQ3_PIN);
  mq135Value = analogRead(MQ135_PIN);

  temperature = dht.readTemperature();
  humidity = dht.readHumidity();

  Serial.println();
  Serial.println("========== SENSOR DATA ==========");

  Serial.print("MQ-2   : ");
  Serial.println(mq2Value);

  Serial.print("MQ-3   : ");
  Serial.println(mq3Value);

  Serial.print("MQ-135 : ");
  Serial.println(mq135Value);

  Serial.print("Temp   : ");
  Serial.print(temperature);
  Serial.println(" C");

  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.println(" %");

  Serial.println("=================================");
}


// =====================================================
//                    HAZARD CHECK
// =====================================================

void checkHazards() {

  bool gasHazard = false;
  bool temperatureHazard = false;

  if (mq2Value > MQ2_LIMIT) {
    gasHazard = true;
    Serial.println("WARNING: MQ-2 LIMIT EXCEEDED");
  }

  if (mq3Value > MQ3_LIMIT) {
    gasHazard = true;
    Serial.println("WARNING: MQ-3 LIMIT EXCEEDED");
  }

  if (mq135Value > MQ135_LIMIT) {
    gasHazard = true;
    Serial.println("WARNING: MQ-135 LIMIT EXCEEDED");
  }

  if (!isnan(temperature) && temperature > TEMP_LIMIT) {
    temperatureHazard = true;
    Serial.println("WARNING: HIGH TEMPERATURE");
  }

  if (gasHazard || temperatureHazard) {

    if (!hazardDetected) {

      Serial.println();
      Serial.println("!!!!!!!!!!!!!!!!!!!!!!!!");
      Serial.println("       HAZARD DETECTED");
      Serial.println("!!!!!!!!!!!!!!!!!!!!!!!!");

    }

    hazardDetected = true;

    // Stop rover
    stopRover();

    // Turn fan on
    fanON();

  } 
  else {

    hazardDetected = false;

    fanOFF();
  }
}


// =====================================================
//                    LORA
// =====================================================

void sendLoRaData() {

  LoRa.beginPacket();

  LoRa.print("MQ2=");
  LoRa.print(mq2Value);

  LoRa.print(",MQ3=");
  LoRa.print(mq3Value);

  LoRa.print(",MQ135=");
  LoRa.print(mq135Value);

  LoRa.print(",TEMP=");
  LoRa.print(temperature);

  LoRa.print(",HUM=");
  LoRa.print(humidity);

  LoRa.print(",HAZARD=");
  LoRa.print(hazardDetected ? "YES" : "NO");

  LoRa.endPacket();

  Serial.println("LoRa packet sent.");
}


// =====================================================
//                    SERIAL COMMANDS
// =====================================================

void processCommand(char command) {

  switch (command) {

    case 'F':
    case 'f':
      Serial.println("FORWARD");
      moveForward();
      break;

    case 'B':
    case 'b':
      Serial.println("BACKWARD");
      moveBackward();
      break;

    case 'L':
    case 'l':
      Serial.println("LEFT");
      turnLeft();
      break;

    case 'R':
    case 'r':
      Serial.println("RIGHT");
      turnRight();
      break;

    case 'S':
    case 's':
      Serial.println("STOP");
      stopRover();
      break;

    case '+':
      motorSpeed += 20;

      if (motorSpeed > 255)
        motorSpeed = 255;

      Serial.print("Speed = ");
      Serial.println(motorSpeed);
      break;

    case '-':
      motorSpeed -= 20;

      if (motorSpeed < 0)
        motorSpeed = 0;

      Serial.print("Speed = ");
      Serial.println(motorSpeed);
      break;

    case 'D':
    case 'd':
      readSensors();
      break;

    case 'H':
    case 'h':
      hazardDetected = true;
      stopRover();
      fanON();

      Serial.println("MANUAL HAZARD STOP");
      break;

    default:
      break;
  }
}


// =====================================================
//                    SETUP
// =====================================================

void setup() {

  Serial.begin(115200);

  delay(1000);

  Serial.println();
  Serial.println("==================================");
  Serial.println("       MINE SAFETY ROVER");
  Serial.println("==================================");

  // ---------------- MOTOR ----------------

  pinMode(PWMA, OUTPUT);
  pinMode(AIN1, OUTPUT);
  pinMode(AIN2, OUTPUT);

  pinMode(PWMB, OUTPUT);
  pinMode(BIN1, OUTPUT);
  pinMode(BIN2, OUTPUT);

  pinMode(STBY, OUTPUT);

  digitalWrite(STBY, HIGH);

  stopRover();

  // ---------------- FAN ----------------

  pinMode(FAN_PIN, OUTPUT);
  fanOFF();

  // ---------------- ADC ----------------

  analogReadResolution(12);

  // ---------------- DHT ----------------

  dht.begin();

  // ---------------- LORA ----------------

  SPI.begin(
    LORA_SCK,
    LORA_MISO,
    LORA_MOSI,
    LORA_CS
  );

  LoRa.setPins(
    LORA_CS,
    LORA_RST,
    LORA_DIO0
  );

  Serial.println("Starting LoRa...");

  if (!LoRa.begin(LORA_FREQUENCY)) {

    Serial.println("LoRa FAILED!");

  } 
  else {

    Serial.println("LoRa INITIALIZED");
  }

  Serial.println();
  Serial.println("Commands:");
  Serial.println("F = Forward");
  Serial.println("B = Backward");
  Serial.println("L = Left");
  Serial.println("R = Right");
  Serial.println("S = Stop");
  Serial.println("+ = Increase speed");
  Serial.println("- = Decrease speed");
  Serial.println("D = Sensor data");
  Serial.println("H = Emergency hazard stop");

  Serial.println();
  Serial.println("ROVER READY");
}


// =====================================================
//                    LOOP
// =====================================================

void loop() {

  // ---------------- SERIAL CONTROL ----------------

  if (Serial.available()) {

    char command = Serial.read();

    processCommand(command);
  }


  // ---------------- SENSOR READING ----------------

  if (millis() - lastSensorRead >= 1000) {

    lastSensorRead = millis();

    readSensors();

    checkHazards();
  }


  // ---------------- LORA ----------------

  if (millis() - lastLoRaSend >= 2000) {

    lastLoRaSend = millis();

    sendLoRaData();
  }
}