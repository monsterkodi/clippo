#!/usr/bin/env bash
cd `dirname $0`/..

2>/dev/null 1>/dev/null killall clippo
2>/dev/null 1>/dev/null killall clippo

konrad --run

IGNORE="/(.*\.dmg$|Icon$|watch$|coffee$|icons$|.*md$|pug$|styl$|.*\.noon$|.*\.lock$|img/banner\.png)"

node_modules/electron-packager/cli.js . --overwrite --icon=img/clippo.icns --ignore=$IGNORE
