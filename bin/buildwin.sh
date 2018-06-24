#!/usr/bin/env bash
cd `dirname $0`/..

if rm -rf clippo-win32-x64; then

    konrad
    
    node_modules/.bin/electron-rebuild
    
    IGNORE="/(.*\.dmg$|Icon$|watch$|coffee$|icons$|.*md$|pug$|styl$|.*\.noon$|.*\.lock$|img/banner\.png)"
    
    node_modules/electron-packager/cli.js . --overwrite --icon=img/app.ico --ignore=$IGNORE

fi
