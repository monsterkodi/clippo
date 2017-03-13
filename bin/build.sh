#!/usr/bin/env bash
cd `dirname $0`/..

NAME=`sds -rp productName`

killall $NAME
killall $NAME

konrad --run

node_modules/electron-packager/cli.js . --overwrite --icon=img/$NAME.icns

rm $NAME-darwin-x64/LICENSE*
rm $NAME-darwin-x64/version

open $NAME-darwin-x64/$NAME.app 
