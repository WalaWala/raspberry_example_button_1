var gpio = require("rpi-gpio");
var readLine = require("readline");
var rl = readLine.createInterface({
	input: process.stdin,
	output: process.stdout
});
var gpios = [[11, gpio.DIR_OUT], [12, gpio.DIR_OUT], [13, gpio.DIR_IN]];

setupGPIOS(gpios).then(logic);

function setupGPIOS(gpios) {
	var promise = new Promise(function (resolve, reject) {
		var pinsReady = 0;
		
		for (var pin of gpios) {
			if (pin[1] === gpio.DIR_IN) {
				gpio.setup(pin[0], pin[1], gpio.EDGE_BOTH);
				gpioReady();
			} else {
				gpio.setup(pin[0], pin[1], gpioReady);
			}
		}
		
		function gpioReady() {
			pinsReady++;
			if (pinsReady === gpios.length) {
				resolve();
			}
		}
	});
	
	return promise;
}

function logic() {
	gpio.on('change', function(channel, value) {
		console.log('Channel ' + channel + ' value is now ' + value);
		setPin(value);
	});
	setPin(true);
	//setInterval(function () { readPin(13); }, 500);
	
	function readPin(id) {
		gpio.read(id, function(err, value) {
			console.log("The value of pin " + id + " is " + value);
		});
	}
	
	function setPin(on, callback) {
		gpio.write(11, on, function(err) {
			gpio.write(12, !on, function(err) {
				if (err) throw err;
				if (callback) 
					callback();
			});
		});
	}
	
	function quit() {
		gpio.destroy(function () {
			process.exit();
		});
	}
}

