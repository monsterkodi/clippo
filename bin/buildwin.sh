#!/usr/bin/env bash
cd `dirname $0`/..

rm -r clippo-win32-x64

konrad

node_modules/.bin/electron-rebuild

IGNORE="/(.*\.dmg$|Icon$|watch$|coffee$|icons$|.*md$|pug$|styl$|.*\.noon$|.*\.lock$|img/banner\.png)"

# no-prune???
node_modules/electron-packager/cli.js . --overwrite --icon=img/app.ico --no-prune --ignore=$IGNORE--win32metadata.FileDescription=clippo

