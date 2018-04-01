#!/usr/bin/env bash
cd `dirname $0`/..

2>/dev/null 1>/dev/null killall clippo
2>/dev/null 1>/dev/null killall clippo

rm -rf /Applications/clippo.app
cp -R clippo-darwin-x64/clippo.app /Applications

open /Applications/clippo.app 
