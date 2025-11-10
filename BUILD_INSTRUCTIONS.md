# BÍN-kjarninn Build Instructions

## Overview
This is a clean React Native 0.73.9 project for the BÍN-kjarninn Icelandic dictionary app. This repository was created to avoid the dependency hell issues of the previous `smaBIN` repository.

## Prerequisites

### Required Software
- **Node.js**: 20.19.2 (via nvm recommended)
- **npm**: Latest version
- **Java**: OpenJDK 19 (JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-19.jdk/Contents/Home)
- **Android SDK**: Latest version
- **Xcode**: Latest version (for iOS builds)
- **CocoaPods**: Latest version (for iOS dependencies)

### Environment Setup
```bash
# Install Node.js via nvm
nvm install 20.19.2
nvm use 20.19.2

# Verify Java installation
java -version
echo $JAVA_HOME

# Install dependencies
npm install

# iOS setup
cd ios && pod install
```

## Project Structure

### Key Files
- `App.js` - Main navigation component
- `Home.js` - Search functionality with bug fix applied
- `Help.js` - User guide and instructions
- `About.js` - App information and version details
- `languageUtils.js` - Bilingual support (English/Icelandic)
- `*-strings-*.json` - Localization files

### Dependencies (Locked Versions)
```json
{
  "@react-native-async-storage/async-storage": "^2.2.0",
  "@react-navigation/bottom-tabs": "^6.6.1",
  "@react-navigation/native": "^6.1.18",
  "@react-navigation/stack": "^6.4.1",
  "axios": "^1.13.2",
  "react": "18.2.0",
  "react-native": "0.73.9",
  "react-native-localization": "^2.3.2",
  "react-native-safe-area-context": "^4.11.1",
  "react-native-screens": "^3.34.0",
  "react-native-vector-icons": "^10.3.0"
}
```

## Android Build Process

### Debug Build
```bash
# Clean and build debug APK
JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-19.jdk/Contents/Home ./android/gradlew -p android clean assembleDebug

# Install on connected device
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Release Build (Play Store)
```bash
# Clean and build release APK
JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-19.jdk/Contents/Home ./android/gradlew -p android clean assembleRelease

# Output location
ls -la android/app/build/outputs/apk/release/app-release.apk
```

### Keystore Configuration
The production APK is signed with `google_play_keystore.jks`:
- **Location**: Project root (excluded from git)
- **Alias**: upload
- **Password**: B33fstew

## iOS Build Process

### Development Build
1. Open `ios/smaBINFresh.xcworkspace` in Xcode
2. Select your development team for code signing
3. Connect iPhone device
4. Build and run on device for testing

### Release Build (App Store)
1. Open `ios/smaBINFresh.xcworkspace` in Xcode
2. Select "Any iOS Device (arm64)" target
3. Product → Archive
4. Upload to App Store Connect

### iOS Configuration
- **Bundle Identifier**: `com.smabin`
- **Display Name**: BÍN-kjarninn
- **Version**: 1.23.0 (Build 23)

## Version Information
- **App Version**: 1.23.0
- **Build Number**: 23 (Android), 23 (iOS)
- **React Native**: 0.73.9
- **Last Updated**: November 2025

## Key Features Implemented
- ✅ Bilingual support (English/Icelandic)
- ✅ Custom app icons
- ✅ Navigation icons (Ionicons)
- ✅ Search functionality with wildcard support
- ✅ Updated copyright dates (2002-2025)
- ✅ Home.js bug fix applied
- ✅ Production-ready signing

## Troubleshooting

### Common Issues

#### Metro Bundle Issues
If the app shows "Unable to load script":
1. Ensure Metro is running: `npm start`
2. For device testing, use: `adb reverse tcp:8081 tcp:8081`

#### Android Build Failures
- **Missing Kotlin plugin**: This fresh project avoids this issue
- **Hermes crashes**: Hermes is properly configured in this version
- **Keystore not found**: Ensure `google_play_keystore.jks` is in project root

#### iOS Build Issues
- **Pod install failures**: Delete `ios/Pods/` and `ios/Podfile.lock`, then run `pod install`
- **Code signing**: Ensure development team is selected in Xcode

### Dependency Hell Avoidance
This project was created specifically to avoid the dependency issues in the original `smaBIN` repository:

- **Problem**: React Native version conflicts, Expo integration issues, missing Kotlin plugins
- **Solution**: Fresh RN 0.73.9 project with compatible, locked dependency versions
- **Result**: Clean builds without configuration conflicts

## Testing Checklist

### Android Testing
- [ ] Debug APK installs and runs
- [ ] All navigation tabs work (Leita, Hjálp, Um)
- [ ] Search functionality works
- [ ] Language switching works
- [ ] Icons display properly
- [ ] Release APK builds and signs correctly

### iOS Testing
- [ ] Device build and install successful
- [ ] All navigation tabs work
- [ ] Search functionality matches Android
- [ ] Language switching works
- [ ] Icons and UI match Android version
- [ ] Archive builds successfully

### Cross-Platform Verification
- [ ] Functionality identical on both platforms
- [ ] Home.js bug fix works on both
- [ ] Version information displays correctly
- [ ] Bilingual localization consistent

## Deployment

### Google Play Store
1. Build release APK: `android/app/build/outputs/apk/release/app-release.apk`
2. Upload to Google Play Console
3. Increment version for next release

### Apple App Store
1. Archive in Xcode
2. Upload to App Store Connect
3. Submit for review
4. Increment version for next release

## Future Development

### Repository Management
- **Current repo**: https://github.com/wkstewart/smaBINFresh
- **Legacy repo**: https://github.com/wkstewart/smaBIN (archived for reference)
- **Branch strategy**: Use `main` branch for production-ready code

### Updating Dependencies
When updating React Native or dependencies:
1. Test thoroughly on both platforms
2. Update this documentation
3. Verify keystore/certificate compatibility
4. Test full build process before pushing

### Adding Features
1. Create feature branch
2. Test on both platforms
3. Update version numbers in sync
4. Update this documentation if needed
5. Test full release build process

## Success Metrics
This fresh project achieves:
- ✅ **Clean builds** without dependency conflicts
- ✅ **Production APK** ready for Play Store
- ✅ **iOS project** ready for App Store
- ✅ **Reproducible process** documented for future use
- ✅ **Version parity** between platforms (1.23.0/23)

---

*This documentation ensures future builds can be reproduced without encountering the dependency hell issues that plagued the original smaBIN repository.*