var TLC5947 = require("../tlc5947");

//Max value per channel is 3F;

var tlc = new TLC5947({
  device: "/dev/spidev0.0",
  channels: 24,
  bitsperchannel: 6
});

tlc.allOff();

var inc = true;

var val = "00";

//3F = 111111 = 63
var interval = setInterval(function() {
		
	//console.log(val);
	var val_num = parseInt(val, 16);
	//console.log(val_num);
	if (inc)
		val_num += 0x1;
	else
		val_num -= 0x1;
	//console.log(val_num);
	
	val = val_num.toString(16);
	
	
	//console.log(val + " Up: " + inc);
	
	//console.log("Setting channel 3 to " + val );
	if (val_num <= 0x0 || val_num > 0x3F) {
		//console.log("switch");
		inc = !inc
	}
	else {
		//console.log(val + " " + inc);
		
		//tlc.setChannel(4, val);
		tlc.setChannel(3, val);
		tlc.setChannel(1, val);
		tlc.setChannel(0, val);
		tlc.writeChannels();	
	}	
}, 10);