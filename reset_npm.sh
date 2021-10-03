#!/bin/bash  
rm -rf node_modules/
rm -rf package.lock.json
npm i
react-native start --reset-cache