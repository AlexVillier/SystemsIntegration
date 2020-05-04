var winX = 640;
var winY = 480;

var membraneSynth;
var metalSynth;
var monoSynth;
var lfo;
var loop1, loop2, loop3, endLoop1, endLoop2;

var joystickValue = 0;
var serial;
var portName = 'COM3';
var latestData = "Waiting for data...";
var buttonDown = false;
var buzzerTime = 0.05, buzzerTimer;
var tempoTime = 1.0, tempoTimer = tempoTime;

var tempo = "2n";
var circleX = 150, circleY = 150, diameter = 100;
var backgroundColor = 192;
var cloudX = winX, cloudY = 50, cloudWidth = 150, cloudHeight = 50, cloudRadius = 20;

function setup() {
	// put setup code here
	createCanvas(winX, winY);
	imageMode(CENTER);
	rectMode(CENTER);
	
	var crusher = new Tone.BitCrusher(4).toMaster();
	membraneSynth = new Tone.MembraneSynth({
		"envelope": {
			"release": 0.3
		}
	}).connect(crusher);
	
	metalSynth = new Tone.MetalSynth({
		"frequency": 10,
		"envelope": {
			"decay": 0.7
		}
	}).connect(crusher);
	
	monoSynth = new Tone.MonoSynth({
		"oscillator" : {
			"type" : "triangle"
		}
	}).toMaster();
	monoSynth.volume.value = -48;
	
	lfo = new Tone.LFO("2n", 400, 2000).start();
	lfo.connect(monoSynth.frequency);
	
	var loopMemSynth = new Tone.MembraneSynth({
		"volume": -24
	}).toMaster();
	loopMetalSynth = new Tone.MetalSynth({
		"frequency": 10,
		"envelope": {
			"decay": 0.7
		},
		"volume": -24
	}).toMaster();
	
	loop1 = new Tone.Loop(function() {
		loopMemSynth.triggerAttackRelease("C3", 0.1);
		loopMetalSynth.triggerAttackRelease(0.3, "+8n");
	}, "4n");
	
	loop2 = new Tone.Loop(function() {
		loopMemSynth.triggerAttackRelease("C3", 0.1);
		loopMetalSynth.triggerAttackRelease(0.3, "+32n");
	}, "16n");
	
	loop3 = new Tone.Loop(function() {
		loopMemSynth.triggerAttackRelease("C3", 0.1);
		loopMetalSynth.triggerAttackRelease(0.3, "+64n");
	}, "32n");
	
	endLoop1 = new Tone.Loop(function() {
		loopMetalSynth.triggerAttackRelease(0.3);
	}, "4n");
	
	endLoop2 = new Tone.Loop(function() {
		loopMemSynth.triggerAttackRelease("C3", 0.1);
	}, "2n");
	
	Tone.Transport.start();
	
	configureBackgroundNoise();
	
	serial = new p5.SerialPort();
	serial.open(portName);
	serial.on('data', gotData);
}

function gotData() {
	var currentString = serial.readLine();
	if(currentString != ""){
		//console.log(currentString);
		latestData = parseInt(currentString);
		if(latestData < 1022){
			joystickValue = latestData;
			circleY = winY - joystickValue;
			circleX = joystickValue;
			if(joystickValue <= 192){
				backgroundColor = 192 + (192 - joystickValue) * 0.3;
			}else{
				backgroundColor = 192;
			}
			cloudX = winX - joystickValue;
		} else if(latestData == 1022 && !buttonDown){
			buttonPressed();
			buttonDown = true;
		} else if(latestData == 1023 && buttonDown){
			buttonDown = false;
		}
	}
}

function draw() {
	// put drawing code here
	colorMode(HSB);
	background(backgroundColor, 100, 100);
	
	colorMode(RGB);
	textSize(24);
	textAlign(LEFT, TOP);
	fill(255, 255, 255);
	
	text(buttonDown, 10, 10);
	text(joystickValue, 10, 40);
	text(tempo, 10, 70);
	
	//Draw Stars
	noStroke();
	if(joystickValue <= 150){
		fill(255, 255, 255, 245 - joystickValue);
		circle(200, 200, 20);
	}
	if(joystickValue <= 130){
		circle(100, 100, 20);
	}
	if(joystickValue <= 110){
		circle(500, 300, 20);
	}
	if(joystickValue <= 90){
		circle(350, 100, 20);
	}
	
	//Draw Sun
	strokeWeight(1);
	stroke(0);
	fill(252, 212, 64);
	circle(circleX, circleY, diameter);
	
	//Draw Clouds
	fill(255, 255, 255);
	rect(cloudX, cloudY, cloudWidth, cloudHeight, cloudRadius);
	rect(cloudX - 2 * cloudWidth, cloudY + 1.5 * cloudHeight, cloudWidth, cloudHeight, cloudRadius);
	rect(cloudX + 1.5 * cloudWidth, cloudY + 0.5 * cloudHeight, cloudWidth, cloudHeight, cloudRadius);
	
	//Draw Ground
	fill('#84C011');
	rect(winX / 2, winY - 30, winX, 60);
	
	if(tempoTimer <= 0){
		buzzerTimer = buzzerTime;
		serial.write("H");
		tempoTimer = tempoTime;
	}else{
		tempoTimer -= deltaTime / 1000;
	}
	
	if(buzzerTimer > 0){
		buzzerTimer -= deltaTime / 1000;
	} else  {
		serial.write("L");
	}
}

function configureBackgroundNoise(){
	monoSynth.triggerAttackRelease("C3");
	lfo.frequency.setValueAtTime("2n", "+0.1");
	//lfo.frequency.setValueAtTime("8n", "+20");
	//lfo.frequency.setValueAtTime("16n", "+27");
	//lfo.frequency.setValueAtTime("2n", "+30");
	//loop1.start("+0.1").stop("+20");
	//loop2.start("+20").stop("+27");
	//loop3.start("+27").stop("+30");
	//endLoop1.start("+30");
	//endLoop2.start("+30");
}

function buttonPressed(){
	switch(tempo){
		case "2n": tempo = "4n";
			tempoTime = 0.5;
			break;
		case "4n": tempo = "8n";
			tempoTime = 0.25;
			break;
		case "8n": tempo = "16n";
			tempoTime = 0.125
			break;
		case "16n": tempo = "2n";
			tempoTime = 1.0;
			break;
	}
	tempoTimer = tempoTime;
	lfo.frequency.setValueAtTime(tempo, "+0.1");
	buzzerTimer = buzzerTime;
	serial.write("H");
}

function mousePressed(){
	buttonPressed();
}