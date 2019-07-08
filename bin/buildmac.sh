#!/usr/bin/env bash
cd `dirname $0`/..

if rm -rf clippo-darwin-x64; then

    konrad
    
    node_modules/.bin/electron-rebuild

    IGNORE="/(.*\.dmg$|Icon$|icons$|.*md$|pug$|styl$|.*\.lock$|img/banner\.png)"
    
    # --no-prune needed because of problem with plist. fix me!
    #node_modules/electron-packager/cli.js . --no-prune --overwrite --icon=img/app.icns --ignore=$IGNORE
    node_modules/.bin/electron-packager . --overwrite --icon=img/app.icns --ignore=$IGNORE
fi
