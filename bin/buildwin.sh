#!/usr/bin/env bash
DIR=`dirname $0`
BIN=$DIR/../node_modules/.bin
cd $DIR/..

npm install

if rm -rf clippo-win32-x64; then

    if $BIN/konrad; then

        $BIN/electron-rebuild

        $BIN/electron-packager . --overwrite --icon=img/app.ico

        start clippo-win32-x64/clippo.exe
    fi
fi