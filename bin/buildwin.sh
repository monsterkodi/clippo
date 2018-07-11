#!/usr/bin/env bash
cd `dirname $0`/..

if rm -rf clippo-win32-x64; then

    konrad
    
    node_modules/.bin/electron-rebuild
    
    node_modules/electron-packager/cli.js . --overwrite --icon=img/app.ico --no-prune

    rm -rf clippo-win32-x64/resources/app/node_modules/electron-packager
    rm -rf clippo-win32-x64/resources/app/node_modules/electron-rebuild
    rm -rf clippo-win32-x64/resources/app/node_modules/electron
    rm -rf clippo-win32-x64/resources/app/inno
fi
