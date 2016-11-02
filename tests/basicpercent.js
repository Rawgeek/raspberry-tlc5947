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
  tlc.setChannelPercent(0, "100");
  //Channel 7
  tlc.setChannelPercent(3, "100");
  //Channel 5
  tlc.setChannelPercent(2, "50");
  tlc.writeChannels();
  
  setInterval(function() {
    if (chan == 0 || chan == 6)
      inc = !inc
    
    
    
    if(inc) {
      //console.log(chan + " off (inc)");
      if (chan-1 >= 0) {
        tlc.setChannelPercent(chan-1, "00");
      }
      tlc.setChannelPercent(chan, "33");
      //pattern[chan] = "0";
      chan++;
      //console.log(chan + " on");
      //pattern[chan] = "F";
      tlc.setChannelPercent(chan, "100")
      
      if (chan+1 <= 7) {
        tlc.setChannelPercent(chan+1, "50");
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
        tlc.setChannelPercent(chan+1, "00");
      }
      tlc.setChannelPercent(chan, "50");
      //pattern[chan] = "0";
      chan--;
      //console.log(chan + " on");
      tlc.setChannelPercent(chan, "100");
      
      if (chan-1 >= 0)
        tlc.setChannelPercent(chan-1, "50");
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

