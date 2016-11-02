var TLC5947 = require("../tlc5947.js");

var tlc = new TLC5947({
  device: "/dev/spidev0.0",
  channels: 24,
  bitsperchannel: 6
});

var pattern = []

for (var i = 0; i < 24; i++) {
  pattern.push("0");
}

//tlc.setChannel(0, "0xFFF");
//tlc.setChannel(1, "0x00A");
/*
tlc.allOn()

setTimeout(function() {
 tlc.allOff()
}, 5000)

setTimeout(function() {  
  //tlc.setChannel(0, "FFF");
  tlc.setChannel(2, "7FF");
}, 10000)
*/
//tlc.blank();
console.log("Switching all LEDs Off");
tlc.allOff();

tlc.set
/*
setTimeout(function() {
  var val = (4095).toString(16);
  console.log(val);
  var val2 = (0)
  //bit per channel * channels = total bits
  //total bits / 8 = bytes
  var buff = new Buffer((12*24)/8);
  buff.writeUInt16BE(4095, 0);
  console.log(buff);
  tlc.setPattern(buff);  
}, 1000)

setTimeout(function() {
  tlc.allOff();
}, 11000);

setTimeout(function() {
  var buff = new Buffer("FFFFF7", "hex");
  console.log(buff);
  tlc.setPattern(buff);   
}, 12000)
*/

//tlc.allOn();

setTimeout(function() {
  tlc.allOff();
  var inc = false;
  var chan = 0;
  //tlc.setChannel(0, "FFF");
  //pattern[0] = "F";
  
  //tlc.setChannel(20, "FFF");
  //Channel 1 - 2
  tlc.setChannel(0, "3F");
  //Channel 7
  tlc.setChannel(3, "3F");
  //Channel 5
  tlc.setChannel(2, "1F");
  tlc.writeChannels();
  
  setInterval(function() {
    if (chan == 0 || chan == 6)
      inc = !inc
    
    
    
    if(inc) {
      //console.log(chan + " off (inc)");
      if (chan-1 >= 0) {
        tlc.setChannel(chan-1, "00");
      }
      tlc.setChannel(chan, "1F");
      //pattern[chan] = "0";
      chan++;
      //console.log(chan + " on");
      //pattern[chan] = "F";
      tlc.setChannel(chan, "3F")
      
      if (chan+1 <= 7) {
        tlc.setChannel(chan+1, "1F");
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
        tlc.setChannel(chan+1, "00");
      }
      tlc.setChannel(chan, "1F");
      //pattern[chan] = "0";
      chan--;
      //console.log(chan + " on");
      tlc.setChannel(chan, "3F");
      
      if (chan-1 >= 0)
        tlc.setChannel(chan-1, "1F");
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

