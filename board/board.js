var wpi = require('wiring-pi'),
	http = require('http'),
	lastValue = null;

console.log('reading switch input ...');

// must initialize it first
wpi.wiringPiSetup();

wpi.pinMode(0, wpi.OUTPUT);
wpi.pinMode(1, wpi.INPUT);
wpi.pinMode(2, wpi.INPUT);

var switch0Down = false,
    switch1Down = false;

// pin 0 on
var http = require('http');

function flashLight(){
    wpi.digitalWrite(0, 1);
    setTimeout(function(){
    	wpi.digitalWrite(0, 0);
    }, 100);
}

function sendSwitchData(button){
    http.get('http://127.0.0.1:3000/switch?switch=' + button, function(res) {
        console.log("Received response: " + res.statusCode);
    });
}

(function wait () {
    var switch0Value =wpi.digitalRead(1),
    	switch1Value =wpi.digitalRead(2);

    if (switch0Value === 1){
    	switch0Down = true;
    } else if (switch0Value === 0 && switch0Down){
    	// fire click
    	flashLight();
    	sendSwitchData(0);
    	switch0Down = false;
    	console.log('button 1 clicked');
    }

    if (switch1Value === 1){
    	switch1Down = true;
    } else if (switch1Value === 0 && switch1Down){
    	// fire click
    	flashLight();
    	sendSwitchData(1);
    	switch1Down = false;
    	console.log('button 2 clicked');
    }

    setTimeout(wait, 50);

})();