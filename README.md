# Node JS solution for TLC5947 (Raspberry Pi)
Great thanks to madforce for his solution posted here: https://forums.adafruit.com/viewtopic.php?f=47&t=83906&p=529899

# Installation
`npm install`

Make sure you have python 2.7, GCC. All the things you need to build C++ and use Node-Gyp.

# PinOut
```
All port 1
Rpi TLC5947
5V -> Vcc
GND -> GND
MOSI (19) -> DIN
SCLK (23) -> CLK
CE0 (24) -> LAT
GPIO6 (25) -> /OE (this can be hooked to GND for SPI but it does get toggled for BitBang)
```

# Running Tests
```
cd tests
sudo node basicspi
```


# Additional Comments
You can use the percent version for ease of use change 6 to 24bit (the src is not hard to read). I found that I needed to reboot the raspberry pi when switching from bitbang to spi write modes and vise versa.

Tested on archlinux, Raspbian Jessie
