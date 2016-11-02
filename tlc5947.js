/// <reference path="../../../../typings/node/node.d.ts" />
/// <reference path="../../../../typings/socket.io/socket.io.d.ts" />

//Wiring PI 6 is set to OE which is like a reset for switching all on or all off.
var wpi = require("wiring-pi");
var SPI = {};

/**
 * @constructor
 * tlc5947
 * Sets up an interface between Raspberry PI and SPI Bus on TLC5947
 * SPI Mode is set to 0
 * Max Speed set to 15Mhz just in case they're cascaded.
 * @param [Object] options device, latch, channels, bits 
 */
var TLC5947 = function (options) {
	
	
	
	var self = this;
	
	
	//Set to PWM mode by setting OE Pin Low (which I have made pin 6)
	console.log("initialising");
	console.log(options);
	var _OE_LATCH = options.latch || 6;
	var _MOSI = 12;
	var _SCLK = 14;
	var _CE0_BLANK = 10;
	var _channel_count = options.channels || 24;
	var _bits = options.bitsperchannel || 12
	
	console.log("Setting\r\n" +
	"Latch " + _OE_LATCH + "\r\n"
	+ "MOSI " + _MOSI + "\r\n"
	+ "SCLK " + _SCLK + "\r\n"
	+ "BLANK "  + _CE0_BLANK + "\r\n"
	+ "Channels " + _channel_count + "\r\n"
	+ "Bits per channel " + _bits + "\r\n");
	
	var _write_mode = options.write_mode || TLC5947.WRITE_MODE.BITBANG;
	
	var _spi = {}
	
	console.log("Setting mode " + _write_mode);
	if (_write_mode == TLC5947.WRITE_MODE.BITBANG) {
		wpi.pinMode(_MOSI, wpi.OUTPUT);
		console.log("MOSI");
		wpi.pinMode(_SCLK, wpi.OUTPUT);
		console.log("SCLK");
		wpi.pinMode(_CE0_BLANK, wpi.OUTPUT);
		wpi.digitalWrite(_CE0_BLANK, 0);
	
	}
	else {
		
		SPI = require("spi");
		_spi = 	new SPI.Spi(options.device || "/dev/spidev0.0", {
			"mode": SPI.MODE["MODE_0"],
			"chipSelect": SPI.CS["none"],
			//"size": 12,
			"maxSpeed": 1500000
		});
	}
	
	wpi.setup("wpi");
	wpi.pinMode(_OE_LATCH, wpi.OUTPUT);
	console.log("LATCH");
	wpi.digitalWrite(_OE_LATCH, 0);
	console.log("Done");
	//value = +!value;

	console.log("Priming Channels");
	var _channels = [];
	
	
	var _byte_length = 2;
	
	if (_bits < 8)
	 _byte_length = 8;
	 
	 _byte_length = _bits / 4; 
	
	for (var channel = 0; channel < _channel_count; channel++) {
		var chan = "";
		for (var i = 0; i < _byte_length; i++)
		{
			chan += "0"
		}
		_channels.push(chan);
	}
	
	function pulsePin(pin) {
		wpi.digitalWrite(pin, 1);
		wpi.digitalWrite(pin, 0);	
	}
	
	/**
	 * @function
	 * @param [int] channel
	 * @param [string] value "000" - "FFF" 
	 * PIN12 MOSI
	 * PIN14 SCLK
	 * PIN10 CE0
	 * PIN6  Latch
	 * 
	 */	
	var bitBangChannels = function() {
		//console.log("writing to " + _channels.length + " channels " );
		//_channels.reverse();
		wpi.digitalWrite(_CE0_BLANK, 1);
		for (var i = _channels.length -1; i >= 0; i--)
		{
			//array of 12 bits in reverse as the bits are shifted in.
			var chanbits = parseInt(_channels[i], 16).toString(2).split("")
			for (var k = chanbits.length; k < _bits; k++) {
				chanbits.unshift("0");
			}
			//chanbits.reverse()
			//console.log(i);
			//console.log(i + " - " + chanbits.join(""));
			for (var j = 0; j < chanbits.length; j++) {
				wpi.digitalWrite(_SCLK, 0);
				if (chanbits[j] == "1") { 
					wpi.digitalWrite(_MOSI, 1); 
				} else { 
					wpi.digitalWrite(_MOSI, 0); 
				}
				wpi.digitalWrite(_SCLK, 1);
			}
			
		}
		//_channels.reverse();
		wpi.digitalWrite(_SCLK, 0);
		
		//
		
		wpi.digitalWrite(_OE_LATCH, 1);
		wpi.digitalWrite(_OE_LATCH, 0);
		wpi.digitalWrite(_CE0_BLANK, 0);
	}

	/**
	 * SPI IS BROKEN. Might have something to do with 
	 * setting pin modes for bit bang
	 */
	var spiWriteChannels = function() {
		var _chans = []
		//wpi.digitalWrite(_CE0_BLANK, 1);
		for (var i = _channels.length -1; i >= 0 ; i--)
		{
			//calculate
			if (parseInt(_channels[i], 10) > Math.pow(2, _bits)) {
				_channels[i] = Math.pow(2, _bits).toString(16);
			}
			
			if (parseInt(_channels[i], 10) < 0)
				_channels[i] = "0";
				
			for (var j = _channels[i].length; j < _byte_length; j++)
				_channels[i] = "0" + _channels[i]
			
			_chans.push(_channels[i]);
		}
		//console.log(_chans);
		var buffer = new Buffer(_chans.join(""), "hex")
		console.log("sending");
		console.log(buffer);	
		_spi.open();
		_spi.write(buffer, function(dev, res) {
			//console.log("res");
			//console.log(res);

		})
		_spi.close()
		//wpi.digitalWrite(_CE0_BLANK, 0);		
	}	
	
	this.writeChannels = function () {
		if (_write_mode == TLC5947.WRITE_MODE.BITBANG) {
			bitBangChannels();
		}
		else {
			spiWriteChannels();
		}
	}
	
	/**
	* @function
	* This switches latch GPIO to high (default is WiringPI 6)
	* while latch is high PWM is off
	*/
	this.blank = function() {
		wpi.digitalWrite(_OE_LATCH, 1);	
	}
	
	this.unblank = function() {
		wpi.digitalWrite(_OE_LATCH, 0);
	}

	//Mode 0 is leading edge low - high
	//this is in the TI Datasheet
	/**
	 * @function
	 * @param [number] channel
	 * 0 = /dev/spidev0.0
	 * 1 = /dev/spidev0.1
	 * @param [number] speed
	 * 500,000 - 32,000,000 (0.5 - 32Mhz)
	 * @returns [array] Buffer channels echoed back in reverse.
	 * BROKEN. DON'T THINK I CAN MIX BIT BANG
	 */
	/*
	var _SPI_Channel = 0;
	var _SPI_Speed = 50000;
	var _SPI_Mode = 0;
	this.setupSPI = function(channel, speed, mode) {
		_SPI_Channel = channel || 0;
		_SPI_Mode = mode || 0;
		_SPI_Speed = speed || 50000;
		var res = wpi.wiringPiSPISetupMode(_SPI_Channel, _SPI_Speed, _SPI_Mode)
		if (res > 0)
		 console.log("success");
		else console.error("Failed"); 
	}
	*/
	

	
	/**
		* 
		*/
	this.allOff = function() {
		
		for(var i = 0; i < _channel_count; i++) {
			_channels[i] = "0";
		}
		
		self.writeChannels();
		console.log("All Off");
		/*
		_spi.open();
		var b = new Buffer(_channels.join(""), "hex")
		console.log("sending\r\n" + b);
		_spi.write(b, function(dev, res) {
			console.log(res.toString("hex"));
		});
		_spi.close();
		*/
	}

	this.allOn = function() {
		for(var i = 0; i < _channel_count; i++) {
			_channels[i] = (Math.pow(2, _bits) -1).toString(16);
		}
		console.log("ALL ON");
		console.log(_channels);
		self.writeChannels();
	}
	
	/**
	 * @function
	 * 
	 */
	this.setChannel = function(channel, value) {
		if (!isNaN(parseInt(value, 16))) {
			_channels[channel] = value;
		}
		else {
			console.error("string value 00 - 3F")
		}
	}
	
	/**
	 * @function
	 * @param [number] channel
	 * @param [number] percentage (0 - 100)
	 */
	this.setChannelPercent = function(channel, percent) {
		if (percent < 0) percent * -1;
		if(percent > 100) percent = 100;
		_channels[channel] = ((Math.pow(2, _bits) * (percent / 100)) - 1).toString(16);
		//Can't use toFixed() as it already parses a string so then parse hex string don't work
		_channels[channel] = _channels[channel].split(".")[0];
		if (_channels[channel] == "NaN") {
			console.error("Value is NaN")
			_channels[channel] == "0"
		}
	}
	
	this.setChannelOctet = function(channel, octet) {
		if (octet < 0) octet = octet * -1;
		if (octet > 255) octet = 255;
		var percent = ((octet / 255) * 100).toFixed(0).toString();
		self.setChannelPercent(channel, percent);
	}
	
	this.setRGB = function(channelStart, octets) {
		
	}
	
	this.setColor = function(channelStart, color) {
		
	}
		
	this.setPattern = function(buffer) {
		console.log("sending (" + buffer.length +")\r\n" + buffer.toString("hex"));
		_spi.open();
				
		_spi.write(buffer, function(device, res) {
			console.log(res);
		});
		_spi.close();
	}
	
	this.fadedown = function() {
		var s = ""
		for (var i = 0; i < 24; i++) {
			s += "0xFFF";
		}
		
		var b = new Buffer(s, "hex");
		_spi.open();
		_spi.write(b, function(device, res) {
			console.log(res.toString("hex"))
		})
		var i = 0;
		var loop = setInterval(function() {
			if (i > 0xFFF) {
				i -= 0x020;
				s = "";
				for (var j = 0; j < 24; j++) {
					s += i;	
				}
				b = new Buffer(s, "hex");
				_spi.write(b, function(device, res) {
					//console.log("bytes: " + b.length);
					//console.log(res.toString("binary"));
					
				})
			}
			else {
				clearInterval(loop);
				_spi.close();
			}
		}, 1000)
	}
	
	this.fadeup = function() {
		var s = "";
		for (var i = 0; i < 24; i++) {
			s += "0xFFF"
		}
	}
}

TLC5947.WRITE_MODE = { SPI: "SPI", BITBANG: "BITBANG" };

module.exports = TLC5947;





/*
var blink = setInterval(function() {
	console.log("PIN Now " + value);

},
5000)
*/