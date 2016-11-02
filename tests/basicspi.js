var TLC5947 = require("../tlc5947.js");

var tlc = new TLC5947({
  device: "/dev/spidev0.0",
  channels: 24,
  bitsperchannel: 12,
  write_mode: TLC5947.WRITE_MODE.SPI
});

//tlc.setupSPI();
tlc.allOff();
setTimeout(function() {
  tlc.allOn();
}, 5000)

setTimeout(function() {
  tlc.allOff();
  var chan =  1;
  var value = "FFF";
  console.log("switching channel  " + chan + " to " + value);
  tlc.setChannel(chan, value);
  tlc.writeChannels();
}, 10000);
