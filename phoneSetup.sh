#!/bin/bash

adb reverse tcp:8080 tcp:8080
adb -s 19251FDF6009NF reverse tcp:8080 tcp:8080
npx react-native run-android
pushd ../nativeBackend/server && npm start
popd
