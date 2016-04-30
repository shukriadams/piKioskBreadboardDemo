#!/bin/bash
# Starts the default Raspbian browser, Epiphany, points it to the given url, then maximizes it (F11).
# This is a poor man's version of running Chromium in kiosk mode, Chromium itself being hopelessly out
# of data for the pi. 

logfile="/home/pi/startKiosk.log"

exec 1>>$logfile
exec 2>>$logfile
exec 3>>$logfile

echo "Starting epiphany-browser in 5 seconds..." >> $logfile

sleep 10s;

epiphany-browser http://127.0.0.1:3000/demo.html &

sleep 7s;

xte "key F11" -x:0 &
