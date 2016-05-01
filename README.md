Code and instuctions for a Raspberry Pi demo with custom-build input buttons which can be used to trigger events in a browser.

Goals
===

1 - Input
---
_Goal_ : Create a breadboard with two switches to capture user input, along with an LED to provide feedback of successful input. 

_Why?_ : Being able to convert simple hardware into events allows us to capture "physical" input (clicking a button, standing on a pressure pad, triggering a motion sensor) and respond to these on an inexpensive local computer, or online. A breadboard with two buttons on it is trivial, but the principal can easily be extended.

2 - Web server
---
_Goal_ : Capture user input with an Express webserver. This serves static web assets (HTML, javascripts, images), but can also relay user input from the breddboard via websockets. 

_Why?_ A web server was chosen because we want to create a presentation layer for the user with HTML and Javascript, and those need to be served from somewhere. Instead of using a cloud service, hosting on the Pi itself means one less moving part to maintain. Express also supports websockets, which we'll use to push realtime events to the presentation page.
 
3 - User interface
---
_Goal_ : Create a "kiosk" demonstration webpage to show input from the breadboard as jQuery events.

_Why?_ : Web pages are convenient for creating user interfaces. A webpage can be presented in fullscreen "kiosk" mode on a monitor connected directly the Pi, but also on other devices browsing off the Express server. We wanted to use jQuery events because these are fairly standard in web development, and can be hooked up to many standard web components. For this demo we'll be trigged Fullpage.js browse events.

Required hardware
===
- Raspberry Pi2 running Raspbian(Wheezy)
- A breadboard
- An LED
- 2 switches
- 3 1Kohm resistors
- 5 male-female connector wires

Other versions of the Pi and Raspbian haven't beet tested.

Wiring your breadboard
===
Set your breadboard up as specified in /diagrams/wiring_bb.jpg.

Pi setup
===
First, some basics. This isn't a very technically-demanding demo, but you'll get a stable environment which lets you code and debug each stage. As a Javascript developer, and I wanted to do everything in NodeJS. Everything in here is written and tested on NodeJS version 0.12. I'm going to assume you're already familiar with basic Pi setup and operation such as editing files and Linux permissions.

Lets get started. As usual, update your Pi with

>  sudo apt-get update
>
>  sudo apt-get upgrade

Install Apache, then disable it

> sudo apt-get install apache2 -y
>
> sudo update-rc.d apache2 disable

I'm not sure if this is the best way to set up but I find installing Apache does all necessary configuration for a Pi to work as a webserver. I disable Apache afterwards to free up port 80 for NodeJS to use. We need to route all standard HTTP traffic (port 80) to our NodeJS app (Express) - Raspian doesn't like NodeJS listening on low port numbers. We'll configure NodeJS to listen on a high number like 3000, and then route all traffic from 80 to 3000. 

First, install iptables-persist

> sudo apt-get install iptables-persistent

and agree when it asks about saving rules. This app automatically saves changes made to iptables - without it,  rebooting your pi will cause your changes to be lost. (iptables-persistent requires a system reboot after installing). Then 

> sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000

You don't have to use port 3000, but you'll need to update all the references to port 3000 in the various script files in this demo.


Install NodeJS

> wget http://node-arm.herokuapp.com/node_archive_armhf.deb
>
> sudo dpkg -i node_archive_armhf.deb
>
> node -v

Running "node -v" should return 0.12.6. It's important that you *don't* install NodeJS with **apt-get install nodejs**, this installs the latest version which did not work for what I'm doing here.

Install PM2

> sudo npm install -g pm2

PM stands for "Process Manager", this is a useful NodeJS package for keeping programs running in a server environment. 

1 - BreadBoard code
---
On your Pi, create a folder for the breadboard controller code

> mkdir /home/pi/board. 

Copy everything from this project's /board folder to that folder. You can use SFTP for this. Then

> cd /home/pi/board. 
>
> npm install 

This can take a while. If you've wired your board up correctly, it should be ready to work now, at least partially.
You can test it by running 

> sudo node board 

You should get back the message "Reading switch input...". Click a button your board, the LED should light up, and 
then you get an "ECONNREFUSED" exception and your program will exit.  

Next copy /init.d/nodeBoard to your pi's /etc/init.d folder (you'll need to get past the access restriction on the target folder).

Make it executable and add it to your system startup:

> sudo chmod +x /etc/init.d/nodeBoard
>
> sudo update-rc.d nodeBoard defaults

Test it by running 

> sudo /etc/init.d/nodeBoard start
>
> sudo pm2 list

Pm2 should show that nodeBoard is runnning. Your board's code handler will now start automatically and be left running when your Pi is started. You can always use "sudo pm2 list" to test if the board process is running, which is useful for debugging.

2 - Express
---
Create a folder for express on your pi at 

> sudo mkdir /var/express

Upload the contents of this project's /express folder to it. Set the Express server up with

> cd /var/express
>
> npm install

copy /init.d/express to your pi's /etc/init.d folder. Make it executable and add it to your system startup:

> sudo chmod +x /etc/init.d/express
>
> sudo update-rc.d express defaults

Express will now also be started automatically.

You can confirm express is working with

> sudo node /var/express/app

You should receive "Listening on port 3000". Open a web browser and point it to http://[your Pi's IP number]/test.html. You should see a page saying "test worked".

3 - UI
---
You will need NPM, Bower and Grunt already installed globally on your local system. Build all ui content - in your local /ui folder, run

> npm install
>
> bower install
>
> grunt

Optional step : 
If you want run the UI on a machine other than your Pi, open  /ui/src/js/script.js in a text editor. Find "127.0.0.1" and change this to the IP number of you Pi. 

Copy everything in /ui/src to /var/express/content

4 - Set up kiosk
---
Running your Pi in "kiosk" mode means running a browser on it, and connected a screen so that browser is always running in locked, full screen mode. We'll forego proper kiosk for this demo because at the time of writing only the Chromium browser supports true kiosk mode, but the ARM port of Chromium is out of date and doesn't properly support modern CSS features. We'll fake kiosk mode in the more up-to-date browser Epiphany, which should be installed by default on Raspbian. 

Enable boot-to-desktop in the main pi config menu with (this will a reboot)

> sudo raspi-config

You probably want to install xrdp to remote test your desktop

> sudo apt-get install xrdp

Edit the X server auto start script

> sudo nano /etc/xdg/lxsession/LXDE-pi/autostart

And set its contents to look like 

    @lxpanel --profile LXDE-pi
    @pcmanfm --desktop --profile LXDE-pi
    @xset s off
    @xset -dpms
    @xset s noblank
    @sh /home/pi/startKiosk.sh


Install Xautomation (we need this to automate fullscreening your browser)

> sudo apt-get install xautomation

Copy /board/startKiosk.sh to /home/pi/
Make it executable 

> chmod u+x /home/pi/startKiosk.sh

This script waits 10 seconds, starts a browser on the demo page, then fullscreens it. The 10 second wait is to ensure that Express has started. And that's it, you're set. Clicking the buttons on your controller will scroll the page back or forward.

