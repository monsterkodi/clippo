#!/usr/bin/env bash
cd `dirname $0`/..

if rm -rf clippo-linux-ia32; then

    konrad

    node_modules/.bin/electron-rebuild
    
    node_modules/electron-packager/cli.js . clippo --no-prune --icon=img/menu@2x.png
    
    rm -rf clippo-linux-ia32/resources/app/node_modules/electron-packager
    rm -rf clippo-linux-ia32/resources/app/node_modules/electron-rebuild
    rm -rf clippo-linux-ia32/resources/app/node_modules/electron
    rm -rf clippo-linux-ia32/resources/app/inno

fi
