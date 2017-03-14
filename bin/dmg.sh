#!/usr/bin/env bash
cd `dirname $0`/..

NAME=`sds productName`
VERSION=`sds version`

npm rebuild
rm -f $NAME-*.dmg

./node_modules/.bin/appdmg ./bin/dmg.json $NAME-$VERSION.dmg

open $NAME-$VERSION.dmg