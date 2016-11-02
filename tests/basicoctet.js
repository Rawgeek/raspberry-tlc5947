var TLC5947 = require("../tlc5947.js");

var tlc = new TLC5947({
  device: "/dev/spidev0.0",
  channels: 24,
  bitsperchannel: 6,
  write_mode: TLC5947.WRITE_MODE.SPI
});

var pattern = []

for (var i = 0; i < 24; i++) {
  pattern.push("0");
}

console.log("Switching all LEDs Off");
tlc.allOff();

setTimeout(function() {
  tlc.allOff();
  var inc = false;
  var chan = 0;
  //tlc.setChannel(0, "FFF");
  //pattern[0] = "F";
  
  //tlc.setChannel(20, "FFF");
  //Channel 1 - 2
  tlc.setChannelOctet(0, "255");
  //Channel 7
  tlc.setChannelOctet(3, "255");
  //Channel 5
  tlc.setChannelOctet(2, "127");
  tlc.writeChannels();
  
  setInterval(function() {
    if (chan == 0 || chan == 6)
      inc = !inc
    
    
    
    if(inc) {
      //console.log(chan + " off (inc)");
      if (chan-1 >= 0) {
        tlc.setChannelOctet(chan-1, "0");
      }
      tlc.setChannelOctet(chan, "127");
      //pattern[chan] = "0";
      chan++;
      //console.log(chan + " on");
      //pattern[chan] = "F";
      tlc.setChannelOctet(chan, "255")
      
      if (chan+1 <= 7) {
        tlc.setChannelOctet(chan+1, "127");
      }
      //pattern.reverse();
      //var b = new Buffer(pattern.join(""), "hex");
      //tlc.setPattern(b);
      //pattern.reverse();
      tlc.writeChannels();
    }
    else {
      //console.log(chan + " off (dec)")
      if (chan+1 <= 7) {
        tlc.setChannelOctet(chan+1, "0");
      }
      tlc.setChannelOctet(chan, "127");
      //pattern[chan] = "0";
      chan--;
      //console.log(chan + " on");
      tlc.setChannelOctet(chan, "255");
      
      if (chan-1 >= 0)
        tlc.setChannelOctet(chan-1, "127");
      //pattern[chan] = "F";
      //pattern.reverse();
      //var b = new Buffer(pattern.join(""), "hex");
      //console.log(b.toString("hex"));
      //tlc.setPattern(b);
      //pattern.reverse();
      tlc.writeChannels();
    }
    
  }, 100)
}, 10000)

