Goals
===

*Disclaimer : I'm not a Linux expert, and this guide doesn't assume you are either. There are probably better ways of doing this, feel free to contribute to this document.*

1 - Breadboard
---
_Goal_ : Create a breadboard with two switches to capture user input, along with an LED to provide feedback of successful input. 

_Why?_ : Being able to convert simple hardware into events is the real strength of the Pi, as it allows us to capture "physical" input (clicking a button, standing on a pressure pad, triggering a motion sensor) and respond to these on an inexpensive local computer, or online.

2 - Web server
---
_Goal_ : Capture user input with an Express webserver. This would server static web assets (HTML, javascripts, images), but also relay user input from the breddboard via websockets. 

_Why?_ A web server was chosen mostly because we want to create a presentation layer for the user with HTML and Javascript, and those need to be served from somewhere. Instead of using a cloud service, hosting on the Pi itself is one less device to maintain. Express also supports websockets, which we'll use to push realtime events to the presentation page.
 
3 - User interface
---
_Goal_ : Create a "kiosk" demonstration webpage to show input from the breadboard as jQuery events.

_Why?_ : Web pages are convenient for creating user interfaces - they're also ubiquitous. A webpage can be presented in fullscreen "kiosk" mode on a monitor connected directly the Pi, but also on other devices browsing off the Express server. We wanted to use jQuery events because these are fairly standard in web development, and can be hooked up to many standard web components.

Required hardware
===
- Raspberry Pi2 running Raspian(Wheezy)
- A breadboard
- An LED
- 2 switches
- 3 1Kohm resistors
- 5 male-female connector wires

This should work on older versions of the Pi, but I haven't tried it.

Set your breadboard up as specified in /diagrams/wiring_bb.jpg.

Pi setup
===
First, some basics. This isn't a very technically-demanding demo, but you'll get a stable environment which lets you code and debug each stage, then easily switch to "production mode" wherein your code will be started automatically and kept running once you power you Pi up.

As a Javascript developer, and I wanted to do everything in NodeJS. Everything in here is written and tested on NodeJS version 0.12. 

I'm going to assume you're already familiar with basic Pi setup and operation such as editing files and Linux permissions. I might not always mention "sudo" when it's needed.

Lets get started. As usual, update your Pi itself with

>  sudo apt-get update
>
>  sudo apt-get upgrade

Install Apache, then disable it

> sudo apt-get install apache2 -y
> 
> sudo update-rc.d apache2 disable

*I'm not sure if this is necessary but I find installing Apache does all necessary configuration for a Pi to work as a webserver. I disable Apache afterwards because it's the easiest way to free up port 80 for NodeJS to use.*

We need to route all standard HTTP traffic (port 80) to our NodeJS app (Express) - this is easier said than done because of Raspian doesn't like NodeJS listening on low port numbers. The easiest fix I found was configuring my NodeJS app to listen on a high number like 8080, and the routing all traffic from 80 to 3000. First, install **iptables-persist**

>sudo apt-get install iptables-persistent

and say yes if it asks about saving rules. This app automatically saves changes made to iptables - without it,  rebooting your pi will cause your changes to be lost. (iptables-persistent requires a system reboot after installing). Then 

> sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000

You don't have to use port 3000, anything will do as long as it's high enough for NodeJS to safely bind to.


Install NodeJs
> wget http://node-arm.herokuapp.com/node_archive_armhf.deb
>
> sudo dpkg -i node_archive_armhf.deb
> 
>  node -v

node -v should return 0.12.6 -if it doesn't you might need to change the file it points to. It's important that you *don't* installed node with **apt-get install nodejs**, this installs the latest version of NodeJs which did not work for what I'm doing here.

Install PM2
> sudo npm install -g pm2
PM stands for "Process Manager", this is an extremely useful Node program that starts and keeps node programs running. 

1 - BreadBoard code
---
On your pi, create a folder  /home/pi/board. Your breadboard reader code and related files will go in here. Copy everything from this project's /board folder to that folder. 
Open a console in that folder, and run "npm install". This can take a while.
If you've wired your board up correctly, it should be ready to work now, at least partially.
Run "sudo node board". You should get back the message "Reading switch input...". Click a button your board, the LED lights up, and then you get an "ECONNREFUSED" exception and your program will exit. 

copy /init.d/nodeBoard to your pi's /etc/init.d folder.
Make it executable and add it to your system startup:

> sudo chmod +x /etc/init.d/nodeBoard
> sudo update-rc.d nodeBoard defaults

Test it by running 

>sudo /etc/init.d/nodeBoard start
>sudo pm2 list

Pm2 should show that nodeBoard is runnning. Your board's code handler will now start automatically and be let running when your pi is started.

2 - Express
---
Create a folder for express on your pi at /var/express.
Upload the contents of /express to it. Run "npm install" in it to set Express up.

copy /init.d/express to your pi's /etc/init.d folder.
Make it executable and add it to your system startup:

> sudo chmod +x /etc/init.d/express
> sudo update-rc.d express defaults

Express will now also be started automatically.

You can confirm express is working with
> sudo node /var/express/app

And then opening a web browser to your pi's IP number and /test.html

3 - UI
---
In your /front folder,

> npm install
> bower install
> grunt

Copy everything in /front/src to /var/express/content
