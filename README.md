# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Building APK for Android

There are two main ways to build an APK for your Android app:

### Method 1: EAS Build (Recommended - Cloud Build)

EAS Build is the recommended way to build production-ready APKs. It handles all the complexity in the cloud.

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g eas-cli
   ```

2. **Login to your Expo account**:
   ```bash
   eas login
   ```

3. **Configure EAS Build**:
   ```bash
   eas build:configure
   ```
   This creates an `eas.json` file with build configuration.

4. **Build APK**:
   ```bash
   eas build --platform android --profile preview
   ```
   Or for a production build:
   ```bash
   eas build --platform android --profile production
   ```

5. **Download the APK**: After the build completes, you'll get a download link. You can also download it from [expo.dev](https://expo.dev).

**Note**: For production builds, you may need to configure signing keys. EAS can manage this automatically.

### Method 2: Local Build (Requires Android Studio)

If you prefer to build locally, you'll need Android Studio and Android SDK installed.

1. **Install Android Studio**:
   - Download from [developer.android.com/studio](https://developer.android.com/studio)
   - Install Android SDK and set up environment variables

2. **Prebuild native code**:
   ```bash
   npx expo prebuild
   ```
   This generates the `android/` and `ios/` directories.

3. **Build APK locally**:
   ```bash
   npm run build:android
   ```
   Or directly:
   ```bash
   npx expo run:android --variant release
   ```

4. **Find your APK**: The APK will be located at:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

**For debug APK** (for testing):
```bash
npx expo run:android
```
The debug APK will be at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Environment Setup

Make sure you have a `.env` file with required environment variables (see `.env.example` for reference).

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [EAS Build documentation](https://docs.expo.dev/build/introduction/): Learn about building apps with EAS.
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
