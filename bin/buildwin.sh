#!/usr/bin/env bash
cd `dirname $0`/..

konrad --run

IGNORE="/(.*\.dmg$|Icon$|watch$|coffee$|icons$|.*md$|pug$|styl$|.*\.noon$|.*\.lock$|img/banner\.png)"

node_modules/electron-packager/cli.js . --overwrite --icon=img/clippo.ico --no-prune --ignore=$IGNORE

rm clippo-win32-x64/LICENSE*
rm clippo-win32-x64/version
