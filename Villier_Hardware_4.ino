//Author: Alex Villier
//Date:   5/4/2020
//YouTube Showcase: https://youtu.be/EmiZpmYrxaw

const int buzzerPin = 13;
const int analogIn = A0;
const int buttonPin = 2;
const int ledPin = 6;
int incomingByte;
int joystickValue = 0;
int outputValue = 0;
int buttonState = 0;
int ledValue;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  pinMode(buzzerPin, OUTPUT);
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  if(Serial.available() > 0){
    incomingByte = Serial.read();
    
    //If H, buzzer on
    if(incomingByte == 72){
      digitalWrite(buzzerPin, HIGH);
    } 
    //Else if L, buzzer off
    else if(incomingByte == 76){
      digitalWrite(buzzerPin, LOW);
    }

  }

  joystickValue = analogRead(analogIn);
  outputValue = map(joystickValue, 0, 1023, 0, 480);
  Serial.println(outputValue);

  ledValue = map(joystickValue, 0, 1023, 0, 255);
  analogWrite(ledPin, ledValue);

  buttonState = digitalRead(buttonPin);
  if(buttonState == HIGH){
    Serial.println(1023);
  } else {
    Serial.println(1022);
  }

  delay(5);
}
