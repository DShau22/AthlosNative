#!/bin/bash

adb reverse tcp:8080 tcp:8080
adb -s 92MAX01QK1 reverse tcp:8080 tcp:8080
npx react-native run-android