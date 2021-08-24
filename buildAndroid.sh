react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/

GRADLE_OPTS="-Xmx4g" snyk test -d
rm -rf ./android/app/src/main/res/drawable-* && rm -rf ./android/app/src/main/res/raw
cd android && ./gradlew assembleRelease && cd ..
