var TLC5947 = require("../tlc5947.js");

var tlc = new TLC5947({
  device: "/dev/spidev0.0",
  channels: 24,
  bitsperchannel: 6,
  write_mode: TLC5947.WRITE_MODE.BITBANG
});

//tlc.setupSPI();
tlc.allOff();
setTimeout(function() {
  var chan =  0;
  var value = "3F";
  console.log("switching channel  " + chan + " to " + value);
  tlc.setChannel(chan, value);
  tlc.writeChannels();
}, 3000);
