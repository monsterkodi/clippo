#!/usr/bin/env bash
cd `dirname $0`/..

NAME=`sds -rp productName`
VERSION=`sds -rp version`
VVERSION=v$VERSION
USER=`sds -rp author`
DMG=$NAME-$VERSION.dmg

# echo 'creating release ...'
# github-release release -s $GH_TOKEN -u $USER -r $NAME -t $VVERSION -n $VVERSION
echo 'uploading dmg ...'
github-release upload  -s $GH_TOKEN -u $USER -r $NAME -t $VVERSION -n $DMG -f $DMG

