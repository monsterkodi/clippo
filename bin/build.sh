#!/usr/bin/env bash
cd `dirname $0`/..

NAME=`sds productName`

2>/dev/null 1>/dev/null killall $NAME
2>/dev/null 1>/dev/null killall $NAME

konrad --run

IGNORE="/(.*\.dmg$|Icon$|watch$|coffee$|icons$|.*md$|pug$|styl$|.*\.noon$|.*\.lock$|img/banner\.png)"

node_modules/electron-packager/cli.js . --overwrite --icon=img/$NAME.icns --ignore=$IGNORE

rm $NAME-darwin-x64/LICENSE*
rm $NAME-darwin-x64/version
