# SmaBIN Fresh - Build Documentation

This document provides comprehensive instructions for building the SmaBIN Fresh React Native application for both Android and iOS platforms.

## Prerequisites

### General Requirements
- **Node.js**: 18+ (check with `node --version`)
- **React Native CLI**: Install globally with `npm install -g react-native-cli`
- **Git**: For version control

### Android Requirements
- **Android Studio**: Latest stable version
- **Java Development Kit (JDK)**: JDK 11 or newer
- **Android SDK**: API Level 34+ (Android 14)
- **NDK**: Version 27.1.12297006 or newer (for 16KB page size support)
- **Android Gradle Plugin**: 8.5.1+ 
- **Gradle**: 8.7+

### iOS Requirements (macOS only)
- **Xcode**: 15.0+ with iOS 13.4+ SDK
- **CocoaPods**: Install with `sudo gem install cocoapods`
- **iOS Simulator** or physical iOS device for testing

## Project Setup

```bash
# Clone the repository
git clone https://github.com/wkstewart/smaBINFresh.git
cd smaBINFresh

# Install dependencies
npm install
```

## Building for Android

### Development Build

```bash
# Start Metro bundler (in one terminal)
npm start

# Run on Android device/emulator (in another terminal)
npm run android
# OR
npx react-native run-android
```

### Release Build (AAB for Play Store)

```bash
# Clean previous builds
./android/gradlew -p android clean

# Build release AAB bundle
./android/gradlew -p android bundleRelease

# Output location:
# android/app/build/outputs/bundle/release/app-release.aab
```

### Android Build Configuration

The project is configured for **16KB page size support** required by Google Play Store:

**Key Configuration Files:**
- `android/build.gradle`: NDK version 27.1.12297006, AGP 8.5.1
- `android/gradle.properties`: `android.enableLargePageSize=true`
- `android/app/build.gradle`: `packagingOptions.jniLibs.useLegacyPackaging = false`

## Building for iOS

### Development Build

```bash
# Install iOS dependencies
cd ios && pod install && cd ..

# Start Metro bundler (in one terminal)
npm start

# Run on iOS Simulator (in another terminal)
npm run ios
# OR
npx react-native run-ios
```

### Release Build (Archive for App Store)

```bash
# Navigate to iOS directory
cd ios

# Install/update CocoaPods dependencies
pod install

# Build archive for App Store
xcodebuild -workspace smaBINFresh.xcworkspace \
           -scheme smaBINFresh \
           -configuration Release \
           -archivePath smaBINFresh.xcarchive \
           archive

# Output location:
# ios/smaBINFresh.xcarchive
```

## Version Management

Current version: **1.24.0**

**Android Version Settings:**
- File: `android/app/build.gradle`
- `versionName`: "1.24.0" 
- `versionCode`: 83 (increment for each Play Store release)

**iOS Version Settings:**
- File: iOS project settings or `ios/smaBINFresh/Info.plist`
- `MARKETING_VERSION`: 1.24.0
- `CURRENT_PROJECT_VERSION`: 24

**Package Version:**
- File: `package.json`
- `version`: "1.24.0"

## Common Issues & Troubleshooting

### Android Issues

#### 1. 16KB Page Size Rejection
**Problem**: Play Store rejects with "Your app does not support 16 KB memory page sizes"

**Solution**: Ensure these configurations are set:
```gradle
// android/build.gradle
ndkVersion = "27.1.12297006" // or newer

// android/gradle.properties  
android.enableLargePageSize=true

// android/app/build.gradle
android {
    packagingOptions {
        jniLibs {
            useLegacyPackaging false
        }
    }
}
```

#### 2. Gradle Version Incompatibility
**Problem**: "Minimum supported Gradle version is 8.7"

**Solution**: Update `android/gradle/wrapper/gradle-wrapper.properties`:
```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.7-all.zip
```

#### 3. NDK Not Found
**Problem**: NDK path not configured

**Solution**: 
- Install NDK via Android Studio SDK Manager
- Or set in `local.properties`: `ndk.dir=/path/to/ndk`

#### 4. NewArch Compatibility Issues
**Problem**: C++ compilation errors with new React Native architecture

**Solution**: Disable new architecture in `android/gradle.properties`:
```properties
newArchEnabled=false
```

### iOS Issues

#### 1. CocoaPods Dependencies Missing
**Problem**: "Unable to open base configuration reference file"

**Solution**: 
```bash
cd ios
pod install
cd ..
```

#### 2. Flipper Compilation Errors
**Problem**: C++ compilation errors in Flipper libraries

**Solutions**:
- **Option 1**: Disable Flipper for release builds:
```bash
NO_FLIPPER=1 xcodebuild -workspace smaBINFresh.xcworkspace ...
```
- **Option 2**: Update Flipper in `ios/Podfile` to latest version

#### 3. Build Timeout
**Problem**: iOS build takes too long and times out

**Solution**: iOS builds with many dependencies can take 5-10 minutes. Be patient or increase timeout.

#### 4. Code Signing Issues
**Problem**: Code signing failures

**Solution**: 
- Ensure valid developer account in Xcode
- Check signing certificates in Xcode project settings
- Update provisioning profiles

### General Issues

#### 1. Metro Bundler Cache Issues
**Problem**: JavaScript changes not reflected

**Solution**:
```bash
npx react-native start --reset-cache
```

#### 2. Node Modules Issues
**Problem**: Dependency conflicts or missing packages

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 3. Watchman Issues (macOS)
**Problem**: File watching warnings

**Solution**:
```bash
watchman watch-del '/path/to/smaBINFresh'
watchman watch-project '/path/to/smaBINFresh'
```

## Build Scripts Reference

**Package.json Scripts:**
- `npm start`: Start Metro bundler
- `npm run android`: Run Android development build
- `npm run ios`: Run iOS development build  
- `npm run lint`: Run ESLint
- `npm test`: Run Jest tests

## Environment Variables

**Android Signing** (for release builds):
- Keystore path: `android/app/google_play_keystore.jks`
- Configure in `android/app/build.gradle` signingConfigs

**iOS Signing**:
- Managed through Xcode project settings
- Requires Apple Developer account for App Store builds

## Dependencies Notes

**React Native Version**: 0.73.9
- Stable version with good CocoaPods support
- Compatible with Android API 35 and 16KB page sizes

**Key Dependencies**:
- `@react-navigation/*`: Navigation library
- `react-native-vector-icons`: Icon fonts
- `react-native-localization`: Internationalization
- `react-native-safe-area-context`: Safe area handling

## Archive & Distribution

After successful builds:
- **Android**: Upload `app-release.aab` to Google Play Console
- **iOS**: Upload `smaBINFresh.xcarchive` to App Store Connect via Xcode

**Archive Both Builds**:
```bash
tar -czf smaBINFresh-builds-v1.24.0.tar.gz \
    android/app/build/outputs/bundle/release/app-release.aab \
    ios/smaBINFresh.xcarchive
```

## Support

For build issues:
1. Check this troubleshooting guide
2. Clear caches and reinstall dependencies
3. Verify all prerequisites are correctly installed
4. Check React Native and platform-specific documentation

**Last Updated**: November 2024
**React Native Version**: 0.73.9
**Target Platforms**: Android 14+ (API 35), iOS 13.4+