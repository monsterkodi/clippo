#!/usr/bin/env bash
cd `dirname $0`/..

NAME=`sds productName`

2>/dev/null 1>/dev/null killall $NAME
2>/dev/null 1>/dev/null killall $NAME

rm -rf /Applications/$NAME.app
cp -R $NAME-darwin-x64/$NAME.app /Applications

open /Applications/$NAME.app 
